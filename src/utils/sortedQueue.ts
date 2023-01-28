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
  get length(): number {
    return this.data.length;
  }

  constructor(compareFn: Comparator<T>, initialValues: T[] = []) {
    this.data = [...initialValues].sort(compareFn);
    this.compareFn = compareFn;
  }

  public enqueue(...items: T[]) {
    for (const item of items) {
      // console.log('  inserting', item);

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

      // compare to low and insert accordingly
      if (
        this.data[low] === undefined ||
        this.compareFn(this.data[low], item) > 0
      ) {
        // insert before low (or insert only item)
        this.data.splice(low, 0, item);
      } else {
        // insert after low
        this.data.splice(low + 1, 0, item);
      }
      // console.log('  data', this.data);
    }
  }

  public push(...items: T[]) {
    return this.enqueue(...items);
  }

  // removes and returns item with max value according to compare fn
  public dequeue(): T | undefined {
    return this.data.pop();
  }

  public dequeueMax(): T | undefined {
    return this.dequeue();
  }

  public pop(): T | undefined {
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
