export interface Range {
  min: number;
  max: number;
}

// true if range1 and range2 perfectly touch and do not overlap
export function isRangeContiguous(range1: Range, range2: Range) {
  return range1.max === range2.min - 1 || range2.max === range1.min - 1;
}

// true if either range fully contains the other
export function doesRangeFullyContainOther(range1: Range, range2: Range) {
  if (range1.min <= range2.min && range1.max >= range2.max) {
    return true;
  } else if (range2.min <= range1.min && range2.max >= range1.max) {
    return true;
  } else {
    return false;
  }
}

// true if the ranges overlap at all
export function doesRangeOverlap(range1: Range, range2: Range) {
  if (range1.min <= range2.max && range1.max >= range2.min) {
    return true;
  } else if (range2.min <= range1.max && range2.max >= range1.min) {
    return true;
  } else {
    return false;
  }
}
