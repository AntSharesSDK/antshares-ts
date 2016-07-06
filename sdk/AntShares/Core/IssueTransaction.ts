namespace AntShares.Core
{
    export class IssueTransaction extends Transaction
    {
        public nonce: number;

        public get systemFee()
        {
            for (let i = 0; i < this.outputs.length; i++)
                if (!this.outputs[i].assetId.equals(Blockchain.AntShare.hash) && !this.outputs[i].assetId.equals(Blockchain.AntCoin.hash))
                    return Fixed8.fromNumber(500);
            return Fixed8.Zero;
        }

        constructor()
        {
            super(TransactionType.IssueTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.nonce = reader.readUint32();
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeUint32(this.nonce);
        }
    }
}
