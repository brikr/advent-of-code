import {cloneDeep} from 'lodash';
import {fileMapSync} from '../../utils/file';

interface Visited {
  // key: pc address we've been to; value: true
  [address: string]: boolean;
}

type FuncName = 'nop' | 'acc' | 'jmp';
interface Instruction {
  func: FuncName;
  arg: number;
}

function parseInstruction(line: string): Instruction {
  const arr = line.split(' ');
  return {
    func: arr[0] as FuncName,
    arg: Number(arr[1]),
  };
}

interface ProgramOutput {
  accumulator: number;
  error?: 'loop';
}

function runProgram(program: Instruction[]): ProgramOutput {
  let accumulator = 0;
  let pc = 0;
  const visited: Visited = {};

  while (pc < program.length) {
    if (visited[pc]) {
      // loop!
      return {
        accumulator,
        error: 'loop',
      };
    } else {
      visited[pc] = true;
    }
    const instruction = program[pc];
    switch (instruction.func) {
      case 'nop':
        // nop
        break;
      case 'acc':
        accumulator += instruction.arg;
        break;
      case 'jmp':
        pc += instruction.arg;
        continue;
    }
    pc++;
  }

  return {
    accumulator,
  };
}

function part1() {
  const program = fileMapSync('src/2020/day08/input.txt', line =>
    parseInstruction(line)
  );

  return runProgram(program).accumulator;
}

function part2() {
  const program = fileMapSync('src/2020/day08/input.txt', line =>
    parseInstruction(line)
  );

  let indexToSwap = 0;
  let output = runProgram(program);
  do {
    if (program[indexToSwap].func === 'acc') {
      // only swapping jmp and nop
      indexToSwap++;
      continue;
    }
    const clone = cloneDeep(program);

    // swap the nth instruction between jmp and nop
    if (clone[indexToSwap].func === 'jmp') {
      clone[indexToSwap].func = 'nop';
    } else if (clone[indexToSwap].func === 'nop') {
      clone[indexToSwap].func = 'jmp';
    }

    output = runProgram(clone);
    indexToSwap++;
  } while (output?.error === 'loop');

  return output.accumulator;
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
}

printSolution();
