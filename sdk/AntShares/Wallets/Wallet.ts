namespace AntShares.Wallets
{
    export class Wallet
    {
        public static get CoinVersion() { return 0x17; }

        public static getWIFFromPrivateKey(privateKey: Uint8Array): PromiseLike<string>
        {
            let data = new Uint8Array(38);
            data[0] = 0x80;
            Array.copy(privateKey, 0, data, 1, 32);
            data[33] = 0x01;
            return window.crypto.subtle.digest("SHA-256", new Uint8Array(data.buffer, 0, data.byteLength - 4)).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", new Uint8Array(result));
            }).then(result =>
            {
                let checksum = new Uint8Array(result, 0, 4);
                Array.copy(checksum, 0, data, data.byteLength - 4, 4);
                let wif = data.base58Encode();
                data.fill(0);
                return wif;
            });
        }

        public static toAddress(scriptHash: ArrayBuffer): PromiseLike<string>
        {
            let data = new Uint8Array(25);
            data[0] = Wallet.CoinVersion;
            Array.copy(new Uint8Array(scriptHash), 0, data, 1, 20);
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
