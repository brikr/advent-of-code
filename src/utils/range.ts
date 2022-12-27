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

// "optimizes" an array of ranges, reducing the number of elements and ensuring none overlap
export function optimizeRanges(ranges: Range[]): Range[] {
  const sorted = ranges.sort((a, b) => a.min - b.min);
  const optimized: Range[] = [];

  let current = sorted[0];
  let idx = 1;
  while (idx < sorted.length) {
    if (doesRangeFullyContainOther(current, sorted[idx])) {
      // already accounted for, keep going (no-op)
      // console.log('optimizeRanges:', current, 'fully contains', sorted[idx]);
    } else if (
      doesRangeOverlap(current, sorted[idx]) ||
      isRangeContiguous(current, sorted[idx])
    ) {
      // expand current range and keep going
      // console.log('optimizeRanges:', current, 'overlaps', sorted[idx]);
      current.max = sorted[idx].max;
      // console.log('  new current:', current);
    } else {
      // this range is over
      // console.log('optimizeRanges:', current, 'is separate from', sorted[idx]);
      optimized.push(current);
      current = sorted[idx];
    }
    idx++;
  }
  optimized.push(current);

  return optimized;
}

export function forEachInRange(range: Range, fn: (val: number) => unknown) {
  for (let i = range.min; i <= range.max; i++) {
    fn(i);
  }
}
