import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function part1(lists: [number[], number[]]): number {
  const leftList = [...lists[0]].sort();
  const rightList = [...lists[1]].sort();

  let total = 0;

  for (const [idx, left] of leftList.entries()) {
    const right = rightList[idx];

    total += Math.abs(left - right);
  }

  return total;
}

function part2(lists: [number[], number[]]): number {
  const leftList = [...lists[0]];
  const rightList = [...lists[1]];

  let total = 0;

  for (const left of leftList) {
    total += left * rightList.filter(right => right === left).length;
  }

  return total;
}

const lists: [number[], number[]] = [[], []];
fileMapSync('src/2024/day01/input.txt', line => {
  const nums = line.split('   ').map(Number) as [number, number];

  lists[0].push(nums[0]);
  lists[1].push(nums[1]);
});
printSolution(part1(lists), part2(lists));
