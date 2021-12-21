import {isNumber} from 'lodash';
import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

type SnailfishNumberArray = [
  number | SnailfishNumberArray,
  number | SnailfishNumberArray
];

class SnailfishNumber {
  left: SnailfishNumber | number;
  right: SnailfishNumber | number;
  parent?: SnailfishNumber;

  get isLeft(): boolean {
    return this.parent?.left === this;
  }

  get isRight(): boolean {
    return this.parent?.right === this;
  }

  get isStaticPair(): boolean {
    return isNumber(this.left) && isNumber(this.right);
  }

  constructor(
    left: SnailfishNumber | number,
    right: SnailfishNumber | number,
    parent?: SnailfishNumber
  ) {
    this.left = left;
    this.right = right;
    this.parent = parent;

    if (this.left instanceof SnailfishNumber) {
      this.left.parent = this;
    }
    if (this.right instanceof SnailfishNumber) {
      this.right.parent = this;
    }
  }
}

function arrayToTree([left, right]: SnailfishNumberArray): SnailfishNumber {
  const leftLeaf = isNumber(left) ? left : arrayToTree(left);
  const rightLeaf = isNumber(right) ? right : arrayToTree(right);
  return new SnailfishNumber(leftLeaf, rightLeaf);
}

function treeToArray({left, right}: SnailfishNumber): SnailfishNumberArray {
  const leftHalf = isNumber(left) ? left : treeToArray(left);
  const rightHalf = isNumber(right) ? right : treeToArray(right);
  return [leftHalf, rightHalf];
}

function numberToString({left, right}: SnailfishNumber): string {
  const leftHalf = isNumber(left) ? left : numberToString(left);
  const rightHalf = isNumber(right) ? right : numberToString(right);
  return `[${leftHalf}, ${rightHalf}]`;
}

interface ReductionOperationResult {
  number: SnailfishNumber | number;
  changed: boolean;
}

// explodes in place, and returns true if explosion happened, false otherwise
function explodeIfNecessary(
  number: SnailfishNumber | number
): ReductionOperationResult {
  if (isNumber(number)) {
    // don't xplod a raw number
    return {
      number,
      changed: false,
    };
  }

  if (!number.isStaticPair) {
    // don't explod a pair if it's not just two plain numbers
    // try to xlpod left side, then right side
    let result = explodeIfNecessary(number.left);
    if (result.changed) {
      number.left = result.number;
      return {number, changed: true};
    } else {
      result = explodeIfNecessary(number.right);
      if (result.changed) {
        number.right = result.number;
        return {number, changed: true};
      }
    }
  }

  // this number is a static pair
  if (number.parent?.parent?.parent?.parent) {
    // this pair is nested inside four pairs. xplod

    // find the next number to the left
    let curr: SnailfishNumber | number | undefined = number;
    while (curr.parent && curr.isLeft) {
      curr = curr.parent;
    }
    if (curr.isRight) {
      // go to this node's parent
      curr = curr.parent!;
      if (isNumber(curr.left)) {
        // if this node's left child is a number, then it's the one we want to increment
        curr.left += number.left as number;
      } else {
        // go down to the right until we find the pair whose right child is a number
        while (!isNumber(curr.right)) {
          curr = curr.right;
        }
        // the curr we end up with is the next number to the left
        curr.right += number.left as number;
      }
    }
    // else this number was on the far left. nowhere to go

    // do the same thing but with the next number to the right

    // replace this pair with a zero
    return {
      number: 0,
      changed: true,
    };
  }

  // no xplod necessary
  return {
    number,
    changed: false,
  };
}

// splits in place, and returns true if explosion happened, false otherwise
function splitIfNecessary(number: SnailfishNumber): ReductionOperationResult {
  // TODO :)
  return {number, changed: false};
}

function reduce(number: SnailfishNumber): SnailfishNumber {
  let result: SnailfishNumber | number = number;
  let changed = true;
  while (changed) {
    const explodeResult = explodeIfNecessary(number);
    result = explodeResult.number;
    const splitResult = splitIfNecessary(number);
    result = splitResult.number;
    changed = explodeResult.changed || splitResult.changed;
  }
  return result as SnailfishNumber;
}

function add(o1: SnailfishNumber, o2: SnailfishNumber): SnailfishNumber {
  return reduce(new SnailfishNumber(o1, o2));
}

function magnitude({left, right}: SnailfishNumber): number {
  const leftMag = isNumber(left) ? 3 * left : 3 * magnitude(left);
  const rightMag = isNumber(right) ? 3 * right : 3 * magnitude(right);
  return leftMag + rightMag;
}

function part1(numbers: SnailfishNumber[]): number {
  let result = numbers[0];
  for (const number of numbers.slice(1)) {
    result = add(result, number);
  }

  console.log(numberToString(result));

  return magnitude(result);
}

function part2(numbers: SnailfishNumber[]): number {
  return 0;
}

const numberArrays = fileMapSync(
  'src/day18/input-test.txt',
  // incredibly cheeky parsing
  line => eval(line) as SnailfishNumberArray
);

const numbers = numberArrays.map(arrayToTree);

console.log(numbers.map(numberToString));

printSolution(part1(numbers), part2(numbers));
