namespace AntShares.Core
{
    export class EnrollmentTransaction extends Transaction
    {
        public publicKey: Cryptography.ECPoint;

        public get systemFee() { return Fixed8.fromNumber(1000); }

        constructor()
        {
            super(TransactionType.EnrollmentTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.publicKey = Cryptography.ECPoint.deserializeFrom(reader, Cryptography.ECCurve.secp256r1);
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.write(this.publicKey.encodePoint(true).buffer);
        }
    }
}
