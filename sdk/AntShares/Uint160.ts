/// <reference path="UintVariable.ts"/>

namespace AntShares
{
    let _zero: Uint160;

    export class Uint160 extends UintVariable
    {
        public static get Zero() { return _zero || (_zero = new Uint160()); }

        constructor(value?: ArrayBuffer)
        {
            if (value == null) value = new ArrayBuffer(20);
            if (value.byteLength != 20) throw new RangeError();
            super(new Uint32Array(value));
        }

        public static parse(str: string): Uint160
        {
            if (str.length != 40) throw new RangeError();
            return new Uint160(str.hexToBytes().buffer);
        }
    }
}
