import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

type Command = 'forward' | 'down' | 'up';

interface Instruction {
  command: Command;
  amount: number;
}

function part1(instructions: Instruction[]): number {
  let hPos = 0;
  let depth = 0;
  instructions.forEach(instruction => {
    const {command, amount} = instruction;
    switch (command) {
      case 'forward':
        hPos += amount;
        break;
      case 'down':
        depth += amount;
        break;
      case 'up':
        depth -= amount;
        break;
    }
  });
  return hPos * depth;
}

function part2(instructions: Instruction[]): number {
  let hPos = 0;
  let depth = 0;
  let aim = 0;
  instructions.forEach(instruction => {
    const {command, amount} = instruction;
    switch (command) {
      case 'forward':
        hPos += amount;
        depth += aim * amount;
        break;
      case 'down':
        aim += amount;
        break;
      case 'up':
        aim -= amount;
        break;
    }
  });
  return hPos * depth;
}

const instructions = fileMapSync('src/day02/input.txt', line => {
  const [command, sAmount] = line.split(' ');
  const amount = Number(sAmount);
  return {
    command: command as Command,
    amount,
  };
});
printSolution(part1(instructions), part2(instructions));
