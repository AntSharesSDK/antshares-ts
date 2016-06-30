namespace AntShares.Wallets
{
    export class SignatureContract
    {
        public static createSignatureRedeemScript(publicKey: Uint8Array): ArrayBuffer
        {
            let sb = new Core.Scripts.ScriptBuilder();
            sb.push(Cryptography.ECPoint.decodePoint(publicKey, Cryptography.ECCurve.secp256r1).encodePoint(true));
            sb.add(Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }
    }
}
