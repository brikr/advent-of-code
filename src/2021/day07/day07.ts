import {fileMapSync} from '../../utils/file';
import {median} from '../../utils/median';
import {printSolution} from '../../utils/printSolution';

function part1(crabs: number[]): number {
  const med = median(crabs);
  let sum = 0;
  crabs.forEach(crab => {
    sum += Math.abs(med - crab);
  });
  return sum;
}

function thirdPascal(num: number): number {
  return ((num + 1) * num) / 2;
}

function part2(crabs: number[]): number {
  // find local minima in fuel
  let lastFuel = Infinity;
  let currFuel = Infinity;
  let mid = 0;
  let sum = 0;
  let lastSum = 0;
  while (currFuel < lastFuel || mid === 0) {
    lastFuel = currFuel;
    lastSum = sum;
    sum = 0;
    crabs.forEach(crab => {
      // console.log(crab, thirdPascal(crab));

      const dist = Math.abs(mid - crab);
      const fuel = thirdPascal(dist);
      // console.log(dist, fuel);
      sum += fuel;
    });
    currFuel = sum;
    // console.log(mid, currFuel, lastFuel);
    mid++;
  }
  return lastSum;
}

const crabs = fileMapSync('src/2021/day07/input.txt', line =>
  line.split(',').map(Number)
)[0];
printSolution(part1(crabs), part2(crabs));
