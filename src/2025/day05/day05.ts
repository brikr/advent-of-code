import {fileLines, fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {isInRange, optimizeRanges, Range} from '../../utils/range';

interface Input {
  ranges: Range[];
  ids: number[];
}

function part1(input: Input): number {
  const optimizedRanges = optimizeRanges(input.ranges);

  let numFresh = 0;
  foodId: for (const id of input.ids) {
    for (const range of optimizedRanges) {
      if (isInRange(id, range)) {
        numFresh++;
        continue foodId;
      }
    }
  }

  return numFresh;
}

function part2(input: Input): number {
  const optimizedRanges = optimizeRanges(input.ranges);

  let total = 0;
  for (const range of optimizedRanges) {
    total += range.max - range.min + 1;
  }

  return total;
}

const lines = fileLines('src/2025/day05/input.txt');

const input: Input = {
  ranges: [],
  ids: [],
};

let recordingRanges = true;
for (const line of lines) {
  if (line === '') {
    recordingRanges = false;
    continue;
  }

  if (recordingRanges) {
    const [_, minStr, maxStr] = line.match(/(\d+)-(\d+)/)!;
    input.ranges.push({min: Number(minStr), max: Number(maxStr)});
  } else {
    input.ids.push(Number(line));
  }
}
printSolution(part1(input), part2(input));
