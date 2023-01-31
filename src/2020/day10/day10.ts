import {fileMapSync} from '../../utils/file';

function part1(): number {
  const lines = fileMapSync('src/2020/day10/input.txt', line => Number(line));

  // remove the empty line at end of file
  lines.pop();

  lines.sort((a, b) => a - b);

  // range is 1 -> last number
  const range = lines[lines.length - 1] - 1;

  // number of gaps between joltage adapters
  const count = lines.length - 1;

  // range = 3x + (count - x) where x is number of 1-jolt jumps
  // algebra that to x = (range - count) / 2, then add 1 for jump from wall
  // and 3-jolt jumps is count - (range - count) / 2, then add 1 for jump to your device
  const oneJoltJumps = (range - count) / 2 + 1;
  const threeJoltJumps = count - (range - count) / 2 + 1;

  return oneJoltJumps * threeJoltJumps;
}

function part2(): number {
  const adapters = fileMapSync('src/2020/day10/input.txt', line =>
    Number(line)
  );

  // remove the empty line at end of file
  adapters.pop();

  adapters.sort((a, b) => a - b);

  // key: adapter, value: number of paths that lead to this adapter
  const pathsToMap = new Map<number, number>();

  // base state: 1 path involving our wall socket (joltage 0)
  pathsToMap.set(0, 1);

  for (const adapter of adapters) {
    // the number of paths to this adapter is the sum of the number of paths to all adapters that can reach this one
    // (i.e. all adapters that are within 3 of this one)
    const minusOne = pathsToMap.get(adapter - 1) || 0;
    const minusTwo = pathsToMap.get(adapter - 2) || 0;
    const minusThree = pathsToMap.get(adapter - 3) || 0;
    pathsToMap.set(adapter, minusOne + minusTwo + minusThree);
  }

  return pathsToMap.get(adapters[adapters.length - 1])!;
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
}

printSolution();
