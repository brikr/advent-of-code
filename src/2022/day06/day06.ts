import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function part1(chars: string[]): number {
  for (let i = 4; i <= chars.length; i++) {
    const lastFour = chars.slice(i - 4, i);
    const set = new Set<string>(lastFour);

    if (set.size === 4) {
      return i;
    }
  }
  return 0;
}

function part2(chars: string[]): number {
  for (let i = 14; i <= chars.length; i++) {
    const lastFour = chars.slice(i - 14, i);
    const set = new Set<string>(lastFour);

    if (set.size === 14) {
      return i;
    }
  }
  return 0;
}

const chars = fileMapSync('src/2022/day06/input.txt', line =>
  line.split('')
)[0];
printSolution(part1(chars), part2(chars));
