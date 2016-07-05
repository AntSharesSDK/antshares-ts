namespace AntShares.Core
{
    export interface ISignable extends IO.ISerializable
    {
        deserializeUnsigned(reader: IO.BinaryReader): void;
        serializeUnsigned(writer: IO.BinaryWriter): void;
    }
}
