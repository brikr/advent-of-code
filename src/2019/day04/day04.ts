import {range} from 'lodash';
import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function isValid(val: number, exactlyTwo = false): boolean {
  const digits = String(val).split('');

  const repeats = [];
  let last = '';
  for (const digit of digits) {
    if (digit === last) {
      repeats[repeats.length - 1]++;
    } else {
      repeats.push(1);
    }
    // the digits never decrease
    if (digit < last) {
      return false;
    }
    last = digit;
  }
  // two adjacent digits
  let twoAdjacent = false;
  if (exactlyTwo) {
    twoAdjacent = repeats.includes(2);
  } else {
    twoAdjacent = Boolean(repeats.find(v => v >= 2));
  }
  if (!twoAdjacent) {
    return false;
  }

  return true;
}

function part1(min: number, max: number): number {
  return range(min, max + 1).filter(v => isValid(v)).length;
}

function part2(min: number, max: number): number {
  return range(min, max + 1).filter(v => isValid(v, true)).length;
}

const line = fileLines('src/2019/day04/input.txt')[0];
const [min, max] = line.match(/(\d+)/g)!.map(Number);
printSolution(part1(min, max), part2(min, max));
