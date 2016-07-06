namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        public assetType: AssetType;
        public name: string;
        public amount: Fixed8;
        public issuer: Cryptography.ECPoint;
        public admin: Uint160;

        public get systemFee() { return this.assetType == AssetType.AntShare || this.assetType == AssetType.AntCoin ? Fixed8.Zero : Fixed8.fromNumber(10000); }

        constructor()
        {
            super(TransactionType.RegisterTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.assetType = reader.readByte();
            this.name = reader.readVarString();
            this.amount = reader.readFixed8();
            this.issuer = Cryptography.ECPoint.deserializeFrom(reader, Cryptography.ECCurve.secp256r1);
            this.admin = reader.readUint160();
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeByte(this.assetType);
            writer.writeVarString(this.name);
            writer.writeFixed8(this.amount);
            writer.write(this.issuer.encodePoint(true).buffer);
            writer.writeUintVariable(this.admin);
        }
    }
}
