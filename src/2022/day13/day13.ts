import {isArray, isNumber, flatten} from 'lodash';
import {fileLines} from '../../utils/file';
import {sign} from '../../utils/math';
import {printSolution} from '../../utils/printSolution';

type Packet = Array<Packet | number>;

function compare(left: Packet | number, right: Packet | number): number {
  // If both values are integers, the lower integer should come first. If the left integer is lower than the right
  // integer, the inputs are in the right order. If the left integer is higher than the right integer, the inputs are
  // not in the right order. Otherwise, the inputs are the same integer; continue checking the next part of the input.
  if (isNumber(left) && isNumber(right)) {
    return sign(left - right);
  }

  // If both values are lists, compare the first value of each list, then the second value, and so on. If the left list
  // runs out of items first, the inputs are in the right order. If the right list runs out of items first, the inputs
  // are not in the right order. If the lists are the same length and no comparison makes a decision about the order,
  // continue checking the next part of the input.
  else if (isArray(left) && isArray(right)) {
    let current = 0;
    let idx = 0;
    while (
      current === 0 &&
      (left[idx] !== undefined || right[idx] !== undefined)
    ) {
      if (left[idx] === undefined) {
        return -1;
      } else if (right[idx] === undefined) {
        return 1;
      }
      current = compare(left[idx], right[idx]);
      idx++;
    }
    return current;
  }

  // If exactly one value is an integer, convert the integer to a list which contains that integer as its only value,
  // then retry the comparison. For example, if comparing [0,0,0] and 2, convert the right value to [2] (a list
  // containing 2); the result is then found by instead comparing [0,0,0] and [2].
  else {
    const leftAsArray = isArray(left) ? left : [left];
    const rightAsArray = isArray(right) ? right : [right];
    return compare(leftAsArray, rightAsArray);
  }
}

function part1(pairs: Packet[][]): number {
  let total = 0;
  for (const [idx, [left, right]] of pairs.entries()) {
    const result = compare(left, right);
    // console.log('comparison', left, '//', right, result);
    if (result === -1) {
      total += idx + 1;
    }
  }
  return total;
}

function part2(pairs: Packet[][]): number {
  const allPackets = flatten(pairs);
  allPackets.push([[2]], [[6]]);
  allPackets.sort(compare);

  let twoIdx = 0;
  let sixIdx = 0;
  const stringified = allPackets.map(p => JSON.stringify(p));
  for (const [idx, pString] of stringified.entries()) {
    if (pString === '[[2]]') {
      twoIdx = idx + 1;
    } else if (pString === '[[6]]') {
      sixIdx = idx + 1;
    }
  }

  return twoIdx * sixIdx;
}

const lines = fileLines('src/2022/day13/input.txt');
const pairs: Packet[][] = [];
let currentPair: Packet[] = [];
for (const line of lines) {
  if (line === '') {
    pairs.push(currentPair);
    currentPair = [];
  } else {
    currentPair.push(JSON.parse(line) as Packet);
  }
}
pairs.push(currentPair);

printSolution(part1(pairs), part2(pairs));
