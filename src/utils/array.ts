export function transpose<T>(m: T[][]) {
  return m[0].map((_, i) => m.map(x => x[i]));
}
