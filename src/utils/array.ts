export function transpose<T>(m: T[][]) {
  return m[0].map((_, i) => m.map(x => x[i]));
}

// removes the first element of the array and returns it
export function dequeue<T>(arr: T[]): T | undefined {
  return arr.splice(0, 1)[0];
}

export interface ValueWithIndex {
  value: number;
  index: number;
}
export function maxWithIndex(arr: number[]): ValueWithIndex {
  let max = arr[0];
  let maxIdx = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
      maxIdx = i;
    }
  }

  return {
    value: max,
    index: maxIdx,
  };
}
