import {times} from 'lodash';
import {
  CircularlyLinkedList,
  CLLNode,
} from './../../utils/circularlyLinkedList';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function mixList(cll: CircularlyLinkedList<number>, nodes: CLLNode<number>[]) {
  for (const node of nodes) {
    // console.log('moving node', node.data);
    if (Math.abs(node.data) % (cll.length - 1) === 0) {
      // nop
      continue;
    }
    let curr = node;
    cll.remove(node);
    // TODO: modulo to reduce jumps
    const jumps = Math.abs(node.data) % cll.length;
    // console.log('  number of jumps', jumps);
    if (node.data > 0) {
      times(jumps, () => {
        curr = curr.next;
      });
      // cll.remove(node);
      cll.insertNodeAfter(node, curr);
    } else if (node.data < 0) {
      times(Math.abs(jumps), () => {
        curr = curr.prev;
      });
      // cll.remove(node);
      cll.insertNodeBefore(node, curr);
    }

    // console.log('  size NA', cll.getNodeArray().length);
  }
}

function part1(file: number[]): number {
  const cll = new CircularlyLinkedList<number>();
  const nodes: CLLNode<number>[] = [];
  let zero: CLLNode<number>;
  for (const number of file) {
    const node = cll.append(number);
    nodes.push(node);
    if (number === 0) {
      zero = node;
    }
  }

  mixList(cll, nodes);

  cll.moveHead(zero!);
  const oneK = cll.getByIndex(1000)!;
  const twoK = cll.getByIndex(2000)!;
  const threeK = cll.getByIndex(3000)!;
  // console.log('size NA', cll.getNodeArray().length);
  // console.log(oneK.data, twoK.data, threeK.data);

  return oneK.data + twoK.data + threeK.data;
}

const ENCRYPTION_KEY = 811589153;

function part2(file: number[]): number {
  const cll = new CircularlyLinkedList<number>();
  const nodes: CLLNode<number>[] = [];
  let zero: CLLNode<number>;
  for (const number of file) {
    const node = cll.append(number * ENCRYPTION_KEY);
    nodes.push(node);
    if (number === 0) {
      zero = node;
    }
  }

  times(10, () => {
    mixList(cll, nodes);
  });

  cll.moveHead(zero!);
  const oneK = cll.getByIndex(1000)!;
  const twoK = cll.getByIndex(2000)!;
  const threeK = cll.getByIndex(3000)!;
  // console.log(oneK, twoK, threeK);

  return oneK.data + twoK.data + threeK.data;
}

const file = fileMapSync('src/2022/day20/input.txt', Number);
printSolution(part1(file), part2(file));
