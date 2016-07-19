namespace AntShares.Implementations.Wallets.IndexedDB
{
    export abstract class DbContext
    {
        private db: IDBDatabase;

        constructor(private name: string) { }

        private ensureDbOpened(): PromiseLike<void>
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

        protected onModelCreating(db: IDBDatabase): void { }

        public test(): PromiseLike<void>
        {
            return this.ensureDbOpened();
        }
    }
}
