export class HashSet<T> {
  private _map = new Map<string, T>();

  public hashFn: (item: T) => string;

  constructor(hashFn: (item: T) => string, initialData?: T[]) {
    this.hashFn = hashFn;

    if (initialData) {
      for (const d of initialData) {
        this.add(d);
      }
    }
  }

  add(item: T): this {
    this._map.set(this.hashFn(item), item);
    return this;
  }

  addAll(...items: T[]): this {
    for (const item of items) {
      this.add(item);
    }
    return this;
  }

  clear() {
    this._map.clear();
  }

  delete(item: T): boolean {
    const hash = this.hashFn(item);
    return this._map.delete(hash);
  }

  forEach(fn: (value: T, value2: T, set: this) => void, thisArg?: any): void {
    this._map.forEach((item, _hash) => {
      fn(item, item, this);
    }, thisArg);
  }

  has(item: T): boolean {
    const hash = this.hashFn(item);
    return this._map.has(hash);
  }

  get size(): number {
    return this._map.size;
  }
}
