interface Uint8Array
{
    asSerializable(T: Function): AntShares.IO.ISerializable;
}

Uint8Array.prototype.asSerializable = function (T: Function): AntShares.IO.ISerializable
{
    let ms = new AntShares.IO.MemoryStream(this.buffer, false);
    let reader = new AntShares.IO.BinaryReader(ms);
    return reader.readSerializable(T);
}
