type Comparator<T> = (a: T, b: T) => number;
type Equals<T> = (a: T, b: T) => boolean;

// log n insertion time
// O(1) retrieval time for max/min value
export class SortedQueue<T> {
  public data: T[];
  private compareFn: Comparator<T>;

  get size(): number {
    return this.data.length;
  }

  constructor(compareFn: Comparator<T>, initialValues: T[] = []) {
    this.data = [...initialValues].sort(compareFn);
    this.compareFn = compareFn;
  }

  public enqueue(item: T) {
    let high = this.data.length - 1;
    let low = 0;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.compareFn(this.data[mid], item) < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    // insert right after low
    this.data.splice(low + 1, 0, item);

    // console.log(this.data);
  }

  // removes and returns item with max value according to compare fn
  public dequeue(): T | undefined {
    return this.data.pop();
  }

  public dequeueMax(): T | undefined {
    return this.dequeue();
  }

  // removes and returns item with min value according to compare fn
  public dequeueMin(): T | undefined {
    return this.data.splice(0, 1)[0];
  }

  public includes(item: T, equalsFn: Equals<T>): boolean {
    let high = this.data.length - 1;
    let low = 0;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (equalsFn(this.data[mid], item)) {
        low = mid + 1;
      } else if (this.compareFn(this.data[mid], item) < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return false;
  }
}
