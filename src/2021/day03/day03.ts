import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function part1(lines: string[]): number {
  const rates: Array<{zero: number; one: number}> = [];
  lines.forEach(line => {
    line.split('').forEach((char, idx) => {
      if (!rates[idx]) {
        rates[idx] = {
          zero: 0,
          one: 0,
        };
      }

      if (char === '0') {
        rates[idx].zero++;
      } else {
        rates[idx].one++;
      }
    });
  });

  const gamma = rates.map(rate => (rate.zero > rate.one ? '0' : '1')).join('');
  const epsilon = rates
    .map(rate => (rate.zero > rate.one ? '1' : '0'))
    .join('');

  return parseInt(gamma, 2) * parseInt(epsilon, 2);
}

class TreeNode {
  parent?: TreeNode;
  zero?: TreeNode;
  one?: TreeNode;
  leaf = false;

  value = '';

  // weight is how many total children under that arm
  zeroWeight = 0;
  oneWeight = 0;

  constructor(parent?: TreeNode, bit?: string) {
    this.parent = parent;
    if (parent && bit) {
      this.value = parent.value + bit;
    }
  }

  public getLocalWeight(): number {
    return this.zeroWeight + this.oneWeight + (this.leaf ? 1 : 0);
  }
}

function part2(lines: string[]): number {
  // build a binary tree
  const root = new TreeNode();
  lines.forEach(line => {
    let currentNode = root;
    line.split('').forEach(char => {
      if (char === '0') {
        currentNode.zero ||= new TreeNode(currentNode, '0');
        currentNode = currentNode.zero;
      } else {
        currentNode.one ||= new TreeNode(currentNode, '1');
        currentNode = currentNode.one;
      }
    });
    currentNode.leaf = true;

    // climb back up and update weights
    while (currentNode.parent) {
      currentNode = currentNode.parent;
      currentNode.zeroWeight = currentNode.zero?.getLocalWeight() ?? 0;
      currentNode.oneWeight = currentNode.one?.getLocalWeight() ?? 0;
    }
  });

  // Traverse tree for oxygen generator rating
  let currentNode = root;
  while (!currentNode.leaf) {
    if (currentNode.oneWeight >= currentNode.zeroWeight) {
      // one is greater or its a tie
      currentNode = currentNode.one!;
    } else {
      currentNode = currentNode.zero!;
    }
  }
  const ogr = currentNode.value;

  // co2 scrubber rating
  currentNode = root;
  while (!currentNode.leaf) {
    if (currentNode.zero && currentNode.zeroWeight <= currentNode.oneWeight) {
      // zero is defined and lesser or its a tie
      currentNode = currentNode.zero;
    } else if (currentNode.one) {
      // one is defined and lesser
      currentNode = currentNode.one;
    } else {
      // one isn't defined, gotta go zero
      currentNode = currentNode.zero!;
    }
  }
  const csr = currentNode.value;

  return parseInt(ogr, 2) * parseInt(csr, 2);
}

const lines = fileLines('src/2021/day03/input.txt');
printSolution(part1(lines), part2(lines));
