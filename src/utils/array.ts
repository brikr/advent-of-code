export function transpose<T>(m: T[][]) {
  return m[0].map((x, i) => m.map(x => x[i]));
}
