export interface Range {
  min: number;
  max: number;
}

// true if range1 and range2 perfectly touch and do not overlap
export function isRangeContiguous(range1: Range, range2: Range) {
  return range1.max === range2.min - 1 || range2.max === range1.min - 1;
}
