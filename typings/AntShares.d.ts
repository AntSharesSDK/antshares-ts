declare var Promise: PromiseConstructorLike;

declare function escape(s: string): string;
declare function unescape(s: string): string;

interface Algorithm
{
    hash?: Algorithm;
    iv?: ArrayBuffer | ArrayBufferView;
    length?: number;
    namedCurve?: string;
}

interface Crypto
{
    webkitSubtle?: SubtleCrypto;
}

interface Touch
{
    radiusX: number;
    radiusY: number;
    force: number;
}

interface Window
{
    msCrypto?: Crypto;
    Promise: PromiseConstructorLike;
}
