import {invert, sum, trimStart} from 'lodash';
import {fileLines} from '../../utils/file';
import {logBase} from '../../utils/math';
import {printSolution} from '../../utils/printSolution';

type SnafuDigit = '=' | '-' | '0' | '1' | '2';
const SNAFU_DIGIT_VALUES = {
  '=': -2,
  '-': -1,
  '0': 0,
  '1': 1,
  '2': 2,
} as const;
const SNAFU_DIGIT_CHARS = invert(SNAFU_DIGIT_VALUES) as {
  [key: number]: SnafuDigit;
};

function decToSnafu(val: number): string {
  const digits: SnafuDigit[] = [];
  let place = 0;
  while (5 ** place < val) {
    place++;
  }
  // console.log('first digit for', val, 'at place', place);
  while (place >= 0) {
    const placeValue = 5 ** place;
    // console.log('5**place', placeValue, 'val', val);
    const digitDec = Math.floor(val / placeValue + 0.5);
    const digit = SNAFU_DIGIT_CHARS[digitDec];
    // console.log('  digit', digit);
    digits.push(digit);
    val -= placeValue * digitDec;
    place--;
  }
  return trimStart(digits.join(''), '0');
}

function snafuToDec(val: string): number {
  let total = 0;
  const digits = val.split('').reverse() as SnafuDigit[];
  for (const [idx, digit] of digits.entries()) {
    const placeValue = 5 ** idx;
    total += SNAFU_DIGIT_VALUES[digit] * placeValue;
  }
  // console.log('snafuToDec', val, total);
  return total;
}

function part1(snafuNums: string[]): string {
  const decNums = snafuNums.map(snafuToDec);
  const decTotal = sum(decNums);
  const snafuTotal = decToSnafu(decTotal);
  return snafuTotal;
}

function part2(snafuNums: string[]): string {
  return 'start the blender bud';
}

const snafuNums = fileLines('src/2022/day25/input.txt');
printSolution(part1(snafuNums), part2(snafuNums));
