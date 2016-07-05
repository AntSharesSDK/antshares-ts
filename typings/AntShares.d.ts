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

interface PromiseConstructor
{
    new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseLike<T>;
    all(iterable: PromiseLike<any>[]): PromiseLike<any[]>;
    resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
    prototype: PromiseLike<any>;
}

interface SubtleCrypto
{
    digest(algorithm: string | Algorithm, data: ArrayBuffer): any;
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

declare var Promise: PromiseConstructor;
