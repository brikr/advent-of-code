import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

function part1(depths: number[]): number {
  let numIncreases = 0;
  let prevDepth = Infinity;
  depths.forEach(depth => {
    if (Number(depth) > prevDepth) {
      numIncreases++;
    }
    prevDepth = depth;
  });
  return numIncreases;
}

function part2(depths: number[]): number {
  const windows = [];
  // start at 2 so i tracks the end of each window
  for (let i = 2; i < depths.length; i++) {
    windows.push(depths[i - 2] + depths[i - 1] + depths[i]);
  }
  return part1(windows);
}

const lines = fileMapSync('src/day01/input.txt', line => Number(line));
printSolution(part1(lines), part2(lines));
