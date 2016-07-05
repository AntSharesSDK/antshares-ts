namespace AntShares.Network
{
    export abstract class Inventory implements IO.ISerializable
    {
        public hash: Uint256;

        public ensureHash(): PromiseLike<Uint256>
        {
            if (this.hash != null) return Promise.resolve(this.hash);
            return window.crypto.subtle.digest("SHA-256", this.getHashData()).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", result);
            }).then(result =>
            {
                return this.hash = new Uint256(result);
            });
        }

        public abstract deserialize(reader: IO.BinaryReader): void;

        protected abstract getHashData(): ArrayBuffer;

        public abstract serialize(writer: IO.BinaryWriter): void;
    }
}
