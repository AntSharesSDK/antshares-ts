namespace AntShares.Core
{
    export class ClaimTransaction extends Transaction
    {
        public claims: TransactionInput[];

        constructor()
        {
            super(TransactionType.ClaimTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.claims = <TransactionInput[]>reader.readSerializableArray(TransactionInput);
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeSerializableArray(this.claims);
        }
    }
}
