import {cloneDeep, isNumber} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

type SnailfishNumberArray = [
  number | SnailfishNumberArray,
  number | SnailfishNumberArray
];

class SnailfishNumber {
  private _left!: SnailfishNumber | number;
  private _right!: SnailfishNumber | number;

  parent?: SnailfishNumber;

  get left(): SnailfishNumber | number {
    return this._left;
  }
  set left(val: SnailfishNumber | number) {
    this._left = val;
    if (this._left instanceof SnailfishNumber) {
      this._left.parent = this;
    }
  }

  get right(): SnailfishNumber | number {
    return this._right;
  }
  set right(val: SnailfishNumber | number) {
    this._right = val;
    if (this._right instanceof SnailfishNumber) {
      this._right.parent = this;
    }
  }

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

function numberToString(number: SnailfishNumber | number): string {
  if (isNumber(number)) {
    return String(number);
  }
  const {left, right} = number;
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
    // console.log('    need to xplod', numberToString(number));

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
        // go down to the left once
        curr = curr.left;
        // go down to the right until we find the pair whose right child is a number
        while (!isNumber(curr.right)) {
          curr = curr.right;
        }
        // the curr we end up with is the next number to the left
        curr.right += number.left as number;
      }
    }
    // else this number was on the far left. nowhere to go
    // eslint-disable-next-line prettier/prettier
    // do the same thing but with the next number to the right
    curr = number;
    while (curr.parent && curr.isRight) {
      curr = curr.parent;
    }
    if (curr.isLeft) {
      // go to this node's parent
      curr = curr.parent!;
      if (isNumber(curr.right)) {
        // if this node's right child is a number, then it's the one we want to increment
        curr.right += number.right as number;
      } else {
        // go down to the right once
        curr = curr.right;
        // go down to the left until we find the pair whose left child is a number
        while (!isNumber(curr.left)) {
          curr = curr.left;
        }
        // the curr we end up with is the next number to the right
        curr.left += number.right as number;
      }
    }
    // else this number was on the far right. nowhere to go

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
function splitIfNecessary(
  number: SnailfishNumber | number
): ReductionOperationResult {
  if (isNumber(number)) {
    // split if we need to
    if (number >= 10) {
      // console.log('    need to split', number);
      const left = Math.floor(number / 2);
      const right = Math.ceil(number / 2);
      return {
        number: new SnailfishNumber(left, right),
        changed: true,
      };
    } else {
      return {number, changed: false};
    }
  } else {
    // number is a pair. split left or right if necessary
    let result = splitIfNecessary(number.left);
    if (result.changed) {
      number.left = result.number;
      return {number, changed: true};
    } else {
      result = splitIfNecessary(number.right);
      if (result.changed) {
        number.right = result.number;
        return {number, changed: true};
      }
    }
  }
  return {number, changed: false};
}

function reduce(number: SnailfishNumber): SnailfishNumber {
  // console.log('reducing', numberToString(number));
  let result: SnailfishNumber | number = number;
  let changed = true;
  while (changed) {
    const explodeResult = explodeIfNecessary(number);
    result = explodeResult.number;
    changed = explodeResult.changed;
    if (changed) {
      // console.log('  after explode', numberToString(result));
      continue;
    }
    const splitResult = splitIfNecessary(number);
    result = splitResult.number;
    changed = splitResult.changed;
    if (splitResult.changed) {
      // console.log('  after split', numberToString(result));
    }
  }
  // console.log('after reduce', numberToString(number));
  return result as SnailfishNumber;
}

function add(o1: SnailfishNumber, o2: SnailfishNumber): SnailfishNumber {
  return reduce(new SnailfishNumber(o1, o2));
}

function magnitude({left, right}: SnailfishNumber): number {
  const leftMag = isNumber(left) ? 3 * left : 3 * magnitude(left);
  const rightMag = isNumber(right) ? 2 * right : 2 * magnitude(right);
  return leftMag + rightMag;
}

function part1(numbers: SnailfishNumber[]): number {
  let result = numbers[0];
  for (const number of numbers.slice(1)) {
    result = add(result, number);
  }

  // console.log(numberToString(result));

  return magnitude(result);
}

function part2(numbers: SnailfishNumber[]): number {
  let max = 0;

  // console.log(numbers.map(numberToString));

  for (const o1 of numbers) {
    for (const o2 of numbers) {
      if (o1 === o2) {
        continue;
      }

      let freshO1 = cloneDeep(o1);
      let freshO2 = cloneDeep(o2);

      // console.log(numberToString(freshO1), '+', numberToString(freshO2));
      const result1 = add(freshO1, freshO2);
      const mag1 = magnitude(result1);
      // console.log('  mag', mag1);
      max = Math.max(mag1, max);

      freshO1 = cloneDeep(o1);
      freshO2 = cloneDeep(o2);

      // console.log(numberToString(freshO2), '+', numberToString(freshO1));
      const result2 = add(freshO2, freshO1);
      const mag2 = magnitude(result2);
      // console.log('  mag', mag2);
      max = Math.max(mag2, max);
    }
  }

  return max;
}

const numberArrays = fileMapSync(
  'src/2021/day18/input.txt',
  // incredibly cheeky parsing
  line => eval(line) as SnailfishNumberArray
);

const numbers = numberArrays.map(arrayToTree);

// console.log(numbers.map(numberToString));

printSolution(part1(cloneDeep(numbers)), part2(cloneDeep(numbers)));
