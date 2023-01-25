import {coordString, fromCoordString, Point} from './grid';

export class PointSet {
  private _set = new Set<string>();

  constructor(initialPoints?: Point[]) {
    if (initialPoints) {
      for (const point of initialPoints) {
        this.add(point);
      }
    }
  }

  add(point: Point): this {
    this._set.add(coordString(point));
    return this;
  }

  clear() {
    this._set.clear();
  }

  delete(point: Point): boolean {
    const str = coordString(point);
    return this._set.delete(str);
  }

  forEach(
    fn: (value: Point, value2: Point, set: PointSet) => void,
    thisArg?: any
  ): void {
    this._set.forEach((valueStr, value2Str) => {
      const p = fromCoordString(valueStr);
      const p2 = fromCoordString(value2Str);
      fn(p, p2, this);
    }, thisArg);
  }

  has(value: Point): boolean {
    const str = coordString(value);
    return this._set.has(str);
  }

  get size(): number {
    return this._set.size;
  }
}
