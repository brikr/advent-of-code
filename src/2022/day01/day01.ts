import {max, sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function part1(elfCalories: number[]): number {
  return max(elfCalories) ?? 0;
}

function part2(elfCalories: number[]): number {
  return sum(elfCalories.sort((a, b) => b - a).slice(0, 3));
}

const elfCalories: number[] = [];
let idx = 0;
const lines = fileMapSync('src/2022/day01/input.txt', line => {
  elfCalories[idx] ??= 0;

  if (line === '') {
    idx++;
  } else {
    elfCalories[idx] += Number(line);
  }
});
printSolution(part1(elfCalories), part2(elfCalories));
