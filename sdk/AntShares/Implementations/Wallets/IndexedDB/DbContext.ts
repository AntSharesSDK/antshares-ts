namespace AntShares.Implementations.Wallets.IndexedDB
{
    export abstract class DbContext
    {
        private db: IDBDatabase;

        constructor(private name: string) { }

        protected onModelCreating(db: IDBDatabase): void { }

        public open(): PromiseLike<void>
        {
            if (this.db != null) return Promise.resolve();
            let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            let request = indexedDB.open(this.name, 1);
            return new Promise<void>((resolve, reject) =>
            {
                request.onsuccess = () =>
                {
                    this.db = request.result;
                    resolve();
                };
                request.onupgradeneeded = () =>
                {
                    this.onModelCreating(request.result);
                };
                request.onerror = () =>
                {
                    reject(request.error);
                };
            });
        }

        public transaction(storeNames: string | string[], mode = "readonly"): DbTransaction
        {
            return new DbTransaction(this.db.transaction(storeNames, mode));
        }
    }
}
