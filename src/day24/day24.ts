import {sumBy} from 'lodash';
import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

interface ALU {
  variables: {[name: string]: number};
  input: number[];
}

enum Instruction {
  INPUT = 'inp',
  ADD = 'add',
  MULTIPLY = 'mul',
  DIVIDE = 'div',
  MOD = 'mod',
  EQUAL = 'eql',
}

function executeInstruction(
  alu: ALU,
  instruction: Instruction,
  o1: string,
  o2?: string
) {
  const o1Value = alu.variables[o1] ?? 0;
  let o2Value = Number(o2);
  if (isNaN(o2Value) && o2) {
    // it a variable. get value
    o2Value = alu.variables[o2] ?? 0;
  }
  switch (instruction) {
    case Instruction.INPUT:
      {
        const next = alu.input.splice(0, 1)[0];
        alu.variables[o1] = next;
      }
      break;
    case Instruction.ADD:
      alu.variables[o1] = o1Value + o2Value;
      break;
    case Instruction.MULTIPLY:
      alu.variables[o1] = o1Value * o2Value;
      break;
    case Instruction.DIVIDE:
      alu.variables[o1] = Math.floor(o1Value / o2Value);
      break;
    case Instruction.MOD:
      alu.variables[o1] = o1Value % o2Value;
      break;
    case Instruction.EQUAL:
      alu.variables[o1] = o1Value === o2Value ? 1 : 0;
      break;
    default:
      throw 'wtf';
  }
}

function runNthDigitSlice(lines: string[], alu: ALU, n: number) {
  for (const line of lines.slice(n * 18, n * 18 + 18)) {
    const [instruction, o1, o2] = line.split(' ');
    executeInstruction(alu, instruction as Instruction, o1, o2);
  }
}

interface State {
  aluZ: number;
  input: number[];
}

function part1(lines: string[]): number {
  const highestInputForZByInputLength = new Array(14).fill(undefined).map(
    // key: z, value: highest input that produced that z
    () => new Map<number, number[]>()
  );

  const stack: State[] = [];
  const initialState: State = {
    aluZ: 0,
    input: [],
  };
  stack.push(initialState);

  while (stack.length > 0) {
    const curr = stack.pop()!;

    // console.log('checking state', curr);

    if (curr.input.length === 14) {
      // check done
      if (curr.aluZ === 0) {
        return Number(curr.input.join(''));
      }
      continue;
    }

    let next: State[] = [];

    for (let newDigit = 1; newDigit <= 9; newDigit++) {
      const newInput = [...curr.input, newDigit];
      const alu: ALU = {
        variables: {z: curr.aluZ},
        input: [newDigit],
      };
      runNthDigitSlice(lines, alu, curr.input.length);

      next.push({aluZ: alu.variables.z, input: newInput});
    }

    next = next.filter(state => {
      // cull next states that we have better candidates for
      const zMap = highestInputForZByInputLength[state.input.length - 1];
      // console.log('zmap', state.input.length, zMap.size);
      const previousHighest = zMap.get(state.aluZ);
      if (previousHighest) {
        const inputAsNumber = Number(state.input.join(''));
        const previousHighestAsNumber = Number(previousHighest.join(''));
        if (inputAsNumber > previousHighestAsNumber) {
          // new high score
          zMap.set(state.aluZ, state.input);
        } else {
          // we've seen better, don't explore this state
          return false;
        }
      } else {
        // haven't seen this z before, update the map
        zMap.set(state.aluZ, state.input);
      }
      return true;
    });
    // console.log(next);

    stack.push(...next);
  }

  // woops
  return -1;
}

function part2(lines: string[]): number {
  const lowestInputForZByInputLength = new Array(14).fill(undefined).map(
    // key: z, value: lowest input that produced that z
    () => new Map<number, number[]>()
  );

  const stack: State[] = [];
  const initialState: State = {
    aluZ: 0,
    input: [],
  };
  stack.push(initialState);

  while (stack.length > 0) {
    const curr = stack.pop()!;

    // console.log('checking state', curr);

    if (curr.input.length === 14) {
      // check done
      if (curr.aluZ === 0) {
        return Number(curr.input.join(''));
      }
      continue;
    }

    let next: State[] = [];

    for (let newDigit = 9; newDigit >= 1; newDigit--) {
      const newInput = [...curr.input, newDigit];
      const alu: ALU = {
        variables: {z: curr.aluZ},
        input: [newDigit],
      };
      runNthDigitSlice(lines, alu, curr.input.length);

      next.push({aluZ: alu.variables.z, input: newInput});
    }

    next = next.filter(state => {
      // cull next states that we have better candidates for
      const zMap = lowestInputForZByInputLength[state.input.length - 1];
      // console.log('zmap', state.input.length, zMap.size);
      const previousLowest = zMap.get(state.aluZ);
      if (previousLowest) {
        const inputAsNumber = Number(state.input.join(''));
        const previousLowestAsNumber = Number(previousLowest.join(''));
        if (inputAsNumber < previousLowestAsNumber) {
          // new low score
          zMap.set(state.aluZ, state.input);
        } else {
          // we've seen better, don't explore this state
          // console.log(
          //   'cullin',
          //   state.aluZ,
          //   inputAsNumber,
          //   previousLowestAsNumber
          // );
          return false;
        }
      } else {
        // haven't seen this z before, update the map
        // console.log('adding', state.aluZ, Number(state.input.join('')));
        zMap.set(state.aluZ, state.input);
      }
      return true;
    });

    // console.log(next);

    stack.push(...next);
  }

  // woops
  return -1;
}

const lines = fileMapSync('src/day24/input.txt', line => line);
printSolution(part1(lines), part2(lines));
