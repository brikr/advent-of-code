import {IntcodeComputer} from './../intcode/intcode';
import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {last} from 'lodash';

function part1(program: string): number {
  const computer = new IntcodeComputer(program);
  // computer.debug = true;
  computer.pushInput(1);
  computer.runProgram();
  return last(computer.takeAllOutputs())!;
}

function part2(program: string): number {
  const computer = new IntcodeComputer(program);
  // computer.debug = true;
  computer.pushInput(5);
  computer.runProgram();
  return last(computer.takeAllOutputs())!;
}

const program = fileLines('src/2019/day05/input.txt')[0];
printSolution(part1(program), part2(program));
