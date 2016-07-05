namespace AntShares.Core
{
    export abstract class Transaction extends Network.Inventory implements ISignable
    {
        public type: TransactionType;
        public attributes: TransactionAttribute[];
        public inputs: TransactionInput[];
        public outputs: TransactionOutput[];
        public scripts: Scripts.Script[];

        public get systemFee() { return Fixed8.Zero; }

        constructor(type: TransactionType)
        {
            super();
            this.type = type;
        }

        public deserialize(reader: IO.BinaryReader): void
        {
            this.deserializeUnsigned(reader);
            this.scripts = <Scripts.Script[]>reader.readSerializableArray(Scripts.Script);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void { }

        public static deserializeFrom(value: ArrayBuffer, offset?: number): Transaction;
        public static deserializeFrom(reader: IO.BinaryReader): Transaction;
        public static deserializeFrom(): Transaction
        {
            if (arguments[0] instanceof ArrayBuffer)
            {
                let value = <ArrayBuffer>arguments[0];
                let offset = arguments.length == 2 ? <number>arguments[1] : 0;
                let ms = new IO.MemoryStream(value, offset, value.byteLength - offset, false);
                let reader = new IO.BinaryReader(ms);
                return Transaction.deserializeFrom(reader);
            }
            else
            {
                let reader = <IO.BinaryReader>arguments[0];
                let type = <TransactionType>reader.readByte();
                let typeName = "AntShares.Core." + TransactionType[type];
                let t = eval(typeName);
                let transaction = <Transaction>new t();
                if (transaction == null) throw new Error();
                transaction.deserializeUnsignedWithoutType(reader);
                transaction.scripts = <Scripts.Script[]>reader.readSerializableArray(Scripts.Script);
                return transaction;
            }
        }

        public deserializeUnsigned(reader: IO.BinaryReader): void
        {
            if (reader.readByte() != this.type)
                throw new Error();
            this.deserializeUnsignedWithoutType(reader);
        }

        private deserializeUnsignedWithoutType(reader: IO.BinaryReader): void
        {
            this.deserializeExclusiveData(reader);
            this.attributes = <TransactionAttribute[]>reader.readSerializableArray(TransactionAttribute);
            this.inputs = <TransactionInput[]>reader.readSerializableArray(TransactionInput);
            this.outputs = <TransactionOutput[]>reader.readSerializableArray(TransactionOutput);
        }

        public getAllInputs(): TransactionInput[]
        {
            return this.inputs;
        }

        protected getHashData(): ArrayBuffer
        {
            let ms = new IO.MemoryStream();
            let w = new IO.BinaryWriter(ms);
            this.serializeUnsigned(w);
            return ms.toArray();
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            this.serializeUnsigned(writer);
            writer.writeSerializableArray(this.scripts);
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void { }

        public serializeUnsigned(writer: IO.BinaryWriter): void
        {
            writer.writeByte(this.type);
            this.serializeExclusiveData(writer);
            writer.writeSerializableArray(this.attributes);
            writer.writeSerializableArray(this.inputs);
            writer.writeSerializableArray(this.outputs);
        }
    }
}
