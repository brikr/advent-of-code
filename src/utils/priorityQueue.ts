const top = 0;
const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i + 1) << 1;

export class PriorityQueue<T> {
  private _heap: T[];
  private _aMoreImportantThanB: (a: T, b: T) => boolean;

  get size(): number {
    return this._heap.length;
  }

  constructor(aMoreImportantThanB = (a: T, b: T) => a > b) {
    this._heap = [];
    this._aMoreImportantThanB = aMoreImportantThanB;
  }

  peek() {
    return this._heap[top];
  }

  push(...values: T[]) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size;
  }

  dequeue() {
    const poppedValue = this.peek();
    const bottom = this.size - 1;
    if (bottom > top) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  private _greater(i: number, j: number) {
    return this._aMoreImportantThanB(this._heap[i], this._heap[j]);
  }

  private _swap(i: number, j: number) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  private _siftUp() {
    let node = this.size - 1;
    while (node > top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }

  private _siftDown() {
    let node = top;
    while (
      (left(node) < this.size && this._greater(left(node), node)) ||
      (right(node) < this.size && this._greater(right(node), node))
    ) {
      const maxChild =
        right(node) < this.size && this._greater(right(node), left(node))
          ? right(node)
          : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}
