import {IntcodeComputer} from './../intcode/intcode';
import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function part1(program: string): number {
  const computer = new IntcodeComputer(program);
  // computer.debug = true;
  computer.writeData(1, 12);
  computer.writeData(2, 2);
  computer.runProgram();
  // console.log(computer.dumpData());
  return computer.readData(0);
}

function part2(program: string): number {
  const computer = new IntcodeComputer(program);
  for (let noun = 0; noun <= 99; noun++) {
    for (let verb = 0; verb <= 99; verb++) {
      computer.reset();
      // computer.debug = true;
      computer.writeData(1, noun);
      computer.writeData(2, verb);
      computer.runProgram();
      // console.log(computer.dumpData());
      const result = computer.readData(0);
      if (result === 19690720) {
        return noun * 100 + verb;
      }
    }
  }
  // woops
  return -1;
}

const program = fileLines('src/2019/day02/input.txt')[0];
printSolution(part1(program), part2(program));
