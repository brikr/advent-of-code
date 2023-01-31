// if idx is between min and max inclusive, idx is returned
// otherwise, a value between min and max is returned as if idx wrapped within the bounds of min and max
export function wrap(min: number, max: number, val: number): number {
  if (val < min) {
    const b = Math.abs(min - val - 1) % (max - min + 1);
    const r = max - min - b;
    return r + min;
  } else if (val > max) {
    return ((val - min) % (max - min + 1)) + min;
  } else {
    return val;
  }
}
