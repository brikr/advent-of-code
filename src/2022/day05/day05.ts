import {cloneDeep, last, times} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Instruction {
  count: number;
  from: number;
  to: number;
}

function getTops(stacks: string[][]): string {
  return stacks.map(s => last(s)).join('');
}

function part1(stacks: string[][], instructions: Instruction[]): string {
  for (const instruction of instructions) {
    times(instruction.count, () => {
      const crate = stacks[instruction.from].pop()!;
      stacks[instruction.to].push(crate);
    });

    // console.log('after', instruction, stacks);
  }

  return getTops(stacks);
}

function part2(stacks: string[][], instructions: Instruction[]): string {
  for (const instruction of instructions) {
    const crates = stacks[instruction.from].splice(
      -instruction.count,
      instruction.count
    );
    stacks[instruction.to].push(...crates);

    // console.log('after', instruction, stacks);
  }

  return getTops(stacks);
}

// crate stacks, as labeled in input (meaning this is 1-indexed)
const stacks: string[][] = [];
const instructions: Instruction[] = [];

fileMapSync('src/2022/day05/input.txt', line => {
  if (line.startsWith(' 1') || line.length === 0) {
    // ignore
  } else if (line.startsWith('move')) {
    // instructions
    const [_, countStr, fromStr, toStr] = line.match(
      /move (\d+) from (\d+) to (\d+)/
    )!;

    instructions.push({
      count: Number(countStr),
      from: Number(fromStr),
      to: Number(toStr),
    });
  } else {
    // initial crate state
    const crateRow = line.match(/( {3,4})|(\[.\] ?)/g)!;

    // console.log(crateRow);

    crateRow.forEach((c, idx) => {
      const contents = c.charAt(1);

      if (contents !== ' ') {
        stacks[idx + 1] ||= [];
        stacks[idx + 1].splice(0, 0, contents);
      }
    });
  }
});

// console.log(stacks);
// console.log(instructions);

printSolution(
  part1(cloneDeep(stacks), instructions),
  part2(cloneDeep(stacks), instructions)
);
