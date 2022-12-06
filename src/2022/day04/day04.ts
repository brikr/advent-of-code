import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {
  doesRangeFullyContainOther,
  doesRangeOverlap,
  Range,
} from '../../utils/range';

function part1(rangePairs: [Range, Range][]): number {
  let count = 0;

  for (const [first, second] of rangePairs) {
    if (doesRangeFullyContainOther(first, second)) {
      // console.log('fully contain:', first, second);
      count++;
    }
  }

  return count;
}

function part2(rangePairs: [Range, Range][]): number {
  let count = 0;

  for (const [first, second] of rangePairs) {
    if (doesRangeOverlap(first, second)) {
      count++;
    }
  }

  return count;
}

const rangePairs = fileMapSync('src/2022/day04/input.txt', line => {
  const [_, r1min, r1max, r2min, r2max] = line
    .match(/(\d+)-(\d+),(\d+)-(\d+)/)!
    .map(Number);

  return [
    {min: r1min, max: r1max},
    {min: r2min, max: r2max},
  ] as [Range, Range];
});
printSolution(part1(rangePairs), part2(rangePairs));
