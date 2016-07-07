if (window.Map == null) window.Map = class <TKey, TValue>
{
    private _map = new Object();

    public get(key: TKey): TValue
    {
        return this._map[<any>key];
    }

    public has(key: TKey): boolean
    {
        return this._map.hasOwnProperty(<any>key);
    }

    public set(key: TKey, value: TValue): void
    {
        this._map[<any>key] = value;
    }
}
