export function transpose<T>(m: T[][]) {
  return m[0].map((_, i) => m.map(x => x[i]));
}

// removes the first element of the array and returns it
export function dequeue<T>(arr: T[]): T | undefined {
  return arr.splice(0, 1)[0];
}
