namespace AntShares.Wallets
{
    export abstract class Wallet
    {
        private path: string;
        private iv: Uint8Array;
        private masterKey: Uint8Array;
        private accounts = new Map<string, Account>();
        private contracts = new Map<string, Contract>();
        private coins: IO.Caching.TrackableCollection<string, Coin>;
        private current_height: number;
        private isrunning = true;

        public static get CoinVersion() { return 0x17; }
        protected get dbPath() { return this.path; }
        protected get walletHeight() { return this.current_height; }

        protected buildDatabase(): PromiseLike<void>
        {
            return Promise.resolve(void 0);
        }

        protected init(path: string, password: string | ArrayBuffer, create: boolean): PromiseLike<void>
        {
            this.path = path;
            let passwordKey: Uint8Array, passwordKeyHash: Uint8Array, aesKey: any;
            let current_version = new Uint8Array([0, 7, 0, 0]);
            return Promise.resolve(typeof password === "string" ? password.toAesKey() : password).then(result =>
            {
                passwordKey = new Uint8Array(result);
                return Promise.all([
                    window.crypto.subtle.digest("SHA-256", passwordKey),
                    window.crypto.subtle.importKey("jwk", <any>{ kty: "oct", k: passwordKey.base64UrlEncode(), alg: "A256CBC", ext: true }, "AES-CBC", false, ["encrypt", "decrypt"])
                ]);
            }).then(results =>
            {
                passwordKeyHash = new Uint8Array(results[0]);
                aesKey = results[1];
                if (create)
                {
                    this.iv = new Uint8Array(16);
                    this.masterKey = new Uint8Array(32);
                    this.coins = new IO.Caching.TrackableCollection<string, Coin>();
                    return Promise.resolve(Core.Blockchain.Default == null ? 0 : Core.Blockchain.Default.getBlockCount()).then(result =>
                    {
                        this.current_height = result;
                        window.crypto.getRandomValues(this.iv);
                        window.crypto.getRandomValues(this.masterKey);
                        return Promise.all([
                            this.buildDatabase(),
                            window.crypto.subtle.encrypt({ name: "AES-CBC", iv: this.iv }, aesKey, this.masterKey)
                        ]);
                    }).then(results =>
                    {
                        return <any>Promise.all([
                            this.saveStoredData("PasswordHash", passwordKeyHash),
                            this.saveStoredData("IV", this.iv.buffer),
                            this.saveStoredData("MasterKey", results[1]),
                            this.saveStoredData("Version", current_version.buffer),
                            this.saveStoredData("Height", new Uint32Array([this.current_height]).buffer)
                        ]);
                    });
                }
                else
                {
                    return Promise.all([
                        this.loadStoredData("PasswordHash"),
                        this.loadStoredData("IV")
                    ]).then(results =>
                    {
                        let passwordHash = new Uint8Array(results[0]);
                        if (passwordHash.length != passwordKeyHash.length)
                            throw new Error();
                        for (let i = 0; i < passwordHash.length; i++)
                            if (passwordHash[i] != passwordKeyHash[i])
                                throw new Error();
                        this.iv = new Uint8Array(results[1]);
                        return Promise.all([
                            this.loadStoredData("MasterKey").then(result =>
                            {
                                return window.crypto.subtle.decrypt({ name: "AES-CBC", iv: this.iv }, aesKey, <any>result);
                            }),
                            this.loadAccounts(),
                            this.loadContracts(),
                            this.loadCoins(),
                            this.loadStoredData("Height"),
                        ]);
                    }).then(results =>
                    {
                        this.masterKey = new Uint8Array(results[0]);
                        for (let i = 0; i < results[1].length; i++)
                            this.accounts.set(results[1][i].publicKeyHash.toString(), results[1][i]);
                        for (let i = 0; i < results[2].length; i++)
                            this.contracts.set(results[2][i].scriptHash.toString(), results[2][i]);
                        this.coins = new IO.Caching.TrackableCollection<string, Coin>(results[3]);
                        this.current_height = (new Uint32Array(results[4]))[0];
                    });
                }
            }).then(() =>
            {
                setTimeout(this.processBlocks.bind(this), Core.Blockchain.SecondsPerBlock * 1000);
            });
        }

        protected abstract loadAccounts(): PromiseLike<Account[]>;

        protected abstract loadCoins(): PromiseLike<Coin[]>;

        protected abstract loadContracts(): PromiseLike<Contract[]>;

        protected abstract loadStoredData(name: string): PromiseLike<ArrayBuffer>;

        protected abstract onProcessNewBlock(block: Core.Block, transactions: Core.Transaction[], added: Coin[], changed: Coin[], deleted: Coin[]): PromiseLike<void>;

        private processBlocks(): void
        {
            if (!this.isrunning) return;
            Promise.resolve(Core.Blockchain.Default == null ? 0 : Core.Blockchain.Default.getBlockCount()).then(result =>
            {
                let block_height = result;
                if (this.current_height >= block_height)
                    return Core.Blockchain.SecondsPerBlock;
                return Core.Blockchain.Default.getBlock(this.current_height).then(result =>
                {
                    if (result == null) return 0;
                    return this.processNewBlock(result).then(() =>
                    {
                        return this.current_height < block_height ? 0 : Core.Blockchain.SecondsPerBlock;
                    });
                });
            }).then(result =>
            {
                if (this.isrunning)
                    setTimeout(this.processBlocks.bind(this), result * 1000);
            });
        }

        private processNewBlock(block: Core.Block): PromiseLike<void>
        {
            let promises = new Array<PromiseLike<Uint160>>();
            promises.push(block.ensureHash());
            for (let i = 0; i < block.transactions.length; i++)
                promises.push(block.transactions[i].ensureHash());
            return Promise.all(promises).then(() =>
            {
                let map = new Map<string, Core.Transaction>();
                for (let i = 0; i < block.transactions.length; i++)
                {
                    let tx = block.transactions[i];
                    for (let index = 0; index < tx.outputs.length; index++)
                    {
                        let output = tx.outputs[index];
                        if (this.contracts.has(output.scriptHash.toString()))
                        {
                            let input = new Core.TransactionInput();
                            input.prevHash = tx.hash;
                            input.prevIndex = index;
                            if (this.coins.has(input.toString()))
                            {
                                this.coins.get(input.toString()).state = CoinState.Unspent;
                            }
                            else
                            {
                                let coin = new Coin();
                                coin.input = input;
                                coin.assetId = output.assetId;
                                coin.value = output.value;
                                coin.scriptHash = output.scriptHash;
                                coin.state = CoinState.Unspent;
                                this.coins.add(coin);
                            }
                            map.set(tx.hash.toString(), tx);
                        }
                    }
                }
                for (let i = 0; i < block.transactions.length; i++)
                {
                    let tx = block.transactions[i];
                    let inputs = tx.getAllInputs();
                    for (let j = 0; j < inputs.length; j++)
                    {
                        let inputKey = inputs[j].toString();
                        if (this.coins.has(inputKey))
                        {
                            if (this.coins.get(inputKey).assetId.equals(Core.Blockchain.AntShare.hash))
                                this.coins.get(inputKey).state = CoinState.Spent;
                            else
                                this.coins.remove(inputKey);
                            map.set(tx.hash.toString(), tx);
                        }
                    }
                }
                for (let i = 0; i < block.transactions.length; i++)
                {
                    if (block.transactions[i].type != Core.TransactionType.ClaimTransaction)
                        continue;
                    let tx = <Core.ClaimTransaction>block.transactions[i];
                    for (let j = 0; j < tx.claims.length; j++)
                    {
                        let claimKey = tx.claims[j].toString();
                        if (this.coins.has(claimKey))
                        {
                            this.coins.remove(claimKey);
                            map.set(tx.hash.toString(), tx);
                        }
                    }
                }
                this.current_height++;
                let changeset = this.coins.getChangeSet();
                if (changeset.length > 0)
                {
                    let transactions = new Array<Core.Transaction>();
                    map.forEach(tx => transactions.push(tx));
                    let added = new Array<Coin>();
                    let changed = new Array<Coin>();
                    let deleted = new Array<Coin>();
                    for (let i = 0; i < changeset.length; i++)
                    {
                        if (changeset[i].trackState == IO.Caching.TrackState.Added)
                            added.push(changeset[i]);
                        else if (changeset[i].trackState == IO.Caching.TrackState.Changed)
                            changed.push(changeset[i]);
                        else if (changeset[i].trackState == IO.Caching.TrackState.Deleted)
                            deleted.push(changeset[i]);
                    }
                    return this.onProcessNewBlock(block, transactions, added, changed, deleted).then(() =>
                    {
                        this.coins.commit();
                        //TODO: dispatchEvent("BalanceChanged")
                    });
                }
            });
        }

        protected abstract saveStoredData(name: string, value: ArrayBuffer): PromiseLike<void>;

        public static toAddress(scriptHash: Uint160): PromiseLike<string>
        {
            let data = new Uint8Array(25);
            data[0] = Wallet.CoinVersion;
            Array.copy(new Uint8Array(scriptHash.bits.buffer), 0, data, 1, 20);
            return window.crypto.subtle.digest("SHA-256", new Uint8Array(data.buffer, 0, 21)).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", result);
            }).then(result =>
            {
                Array.copy(new Uint8Array(result), 0, data, 21, 4);
                return data.base58Encode();
            });
        }
    }
}
