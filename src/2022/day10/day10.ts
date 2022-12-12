import {repeat} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Instruction {
  name: string;
  param?: number;
}

function part1(instructions: Instruction[]): number {
  const afterCycle = new Map<number, number>();
  let currentCycle = 0;
  let x = 1;

  for (const i of instructions) {
    if (i.name === 'noop') {
      currentCycle++;
      afterCycle.set(currentCycle, x);
    } else if (i.name === 'addx') {
      x += i.param!;
      currentCycle += 2;
      afterCycle.set(currentCycle, x);
    }
    // console.log('after instruction', i, 'cycle', currentCycle, 'x', x);
  }

  const IMPORTANT_CYCLES = [20, 60, 100, 140, 180, 220];
  let final = 0;
  for (const cycle of IMPORTANT_CYCLES) {
    // find the nearest entry before it
    let search = cycle - 1;
    let result: number | undefined = undefined;
    while (result === undefined) {
      result = afterCycle.get(search);
      search--;
    }
    final += cycle * result;
    // console.log('cycle', cycle, 'x', result);
  }

  return final;
}

function part2(instructions: Instruction[]): string {
  let currentCycle = 0;
  let spritePos = 1;
  let output = '';

  let currentInstruction: Instruction | undefined = undefined;
  // how many cycles until the current instruction completes
  let cyclesRemaining = 0;
  while (currentCycle < 240) {
    // console.log('cycle', currentCycle + 1, 'sprite position', spritePos);
    if (cyclesRemaining === 0) {
      // dequeue and set new cyclesRemaining
      currentInstruction = instructions.splice(0, 1)[0];
      // console.log('  begin executing', currentInstruction);
      if (currentInstruction.name === 'noop') {
        cyclesRemaining = 1;
      } else if (currentInstruction.name === 'addx') {
        cyclesRemaining = 2;
      }
    }

    // draw if necessary
    if (Math.abs(spritePos - (currentCycle % 40)) <= 1) {
      // pixel is within sprite
      // console.log('  drawing pixel in position', currentCycle);
      output += '#';
    } else {
      output += '.';
    }

    if ((currentCycle + 1) % 40 === 0) {
      output += '\n';
    }

    cyclesRemaining--;
    if (cyclesRemaining === 0) {
      if (currentInstruction) {
        // console.log('  finish executing', currentInstruction);
      }
      // no cycles remaining. perform current instruction and dequeue the next one
      if (currentInstruction?.name === 'addx') {
        spritePos += currentInstruction.param!;
      } // else noop
    }

    currentCycle++;
  }

  return output;
}

const instructions = fileMapSync('src/2022/day10/input.txt', line => {
  const [name, paramStr] = line.split(' ');

  return {
    name,
    param: paramStr ? Number(paramStr) : undefined,
  };
});
printSolution(part1(instructions), part2(instructions));
