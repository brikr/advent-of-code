// key/value map for situations where keys are complex types that don't normally make good keys
export class HashMap<K, V> {
  private _map = new Map<string, [K, V]>();

  public hashFn: (key: K) => string;

  constructor(hashFn: (key: K) => string) {
    this.hashFn = hashFn;
  }

  get(key: K): V | undefined {
    return this._map.get(this.hashFn(key))?.[1];
  }

  set(key: K, value: V): this {
    this._map.set(this.hashFn(key), [key, value]);
    return this;
  }

  clear() {
    this._map.clear();
  }

  delete(key: K): boolean {
    const hash = this.hashFn(key);
    return this._map.delete(hash);
  }

  forEach(fn: (key: K, value: V, map: this) => void, thisArg?: any): void {
    this._map.forEach(([key, value], _hash) => {
      fn(key, value, this);
    }, thisArg);
  }

  has(key: K): boolean {
    const hash = this.hashFn(key);
    return this._map.has(hash);
  }

  get size(): number {
    return this._map.size;
  }
}
