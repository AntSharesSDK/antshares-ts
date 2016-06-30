namespace AntShares.IO
{
    export interface ISerializable
    {
        serialize(writer: BinaryWriter): void;
        deserialize(reader: BinaryReader): void;
    }
}
