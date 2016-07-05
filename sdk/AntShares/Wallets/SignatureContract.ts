namespace AntShares.Wallets
{
    export class SignatureContract
    {
        public static createSignatureRedeemScript(publicKey: Cryptography.ECPoint): ArrayBuffer
        {
            let sb = new Core.Scripts.ScriptBuilder();
            sb.push(publicKey.encodePoint(true));
            sb.add(Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }
    }
}
