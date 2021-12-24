import {isNumber, times} from 'lodash';
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

// : '99111111111111'.split('').map(Number),

function part1(lines: string[]): number {
  const alu: ALU = {
    variables: {},
    input: '29977181511299'.split('').map(Number),
  };

  for (const line of lines) {
    // console.log('executing', line);
    const [instruction, o1, o2] = line.split(' ');
    if (instruction === 'inp') {
      console.log(alu.variables);
    }
    executeInstruction(alu, instruction as Instruction, o1, o2);
  }
  console.log(alu.variables);

  // const xZeroesFirstStep: string[] = [];
  // times(8889, step => {
  //   const firstFourInput = String(9999 - step);
  //   if (firstFourInput.includes('0')) {
  //     return;
  //   }

  //   const alu: ALU = {
  //     variables: {},
  //     input: firstFourInput.split('').map(Number),
  //   };

  //   for (const line of lines.slice(0, 72)) {
  //     // console.log('executing', line);
  //     const [instruction, o1, o2] = line.split(' ');
  //     if (instruction === 'inp') {
  //       // console.log(alu.variables);
  //     }
  //     executeInstruction(alu, instruction as Instruction, o1, o2);
  //     // console.log(alu);
  //   }
  //   // console.log(alu.variables);

  //   if (alu.variables.x === 0) {
  //     xZeroesFirstStep.push(firstFourInput);
  //     console.log('checking further down', firstFourInput);
  //     times(8889, step => {
  //       const firstEightInput = firstFourInput + String(9999 - step);
  //       if (firstEightInput.includes('0')) {
  //         return;
  //       }

  //       const alu: ALU = {
  //         variables: {},
  //         input: firstEightInput.split('').map(Number),
  //       };

  //       for (const line of lines.slice(0, 144)) {
  //         // console.log('executing', line);
  //         const [instruction, o1, o2] = line.split(' ');
  //         if (instruction === 'inp') {
  //           // console.log(alu.variables);
  //         }
  //         executeInstruction(alu, instruction as Instruction, o1, o2);
  //         // console.log(alu);
  //       }
  //       // console.log(alu.variables);

  //       if (alu.variables.x === 0) {
  //         console.log('checking further down', firstEightInput);
  //         times(889, step => {
  //           const firstElevenInput = firstEightInput + String(999 - step);
  //           if (firstElevenInput.includes('0')) {
  //             return;
  //           }

  //           const alu: ALU = {
  //             variables: {},
  //             input: firstElevenInput.split('').map(Number),
  //           };

  //           for (const line of lines.slice(0, 198)) {
  //             // console.log('executing', line);
  //             const [instruction, o1, o2] = line.split(' ');
  //             if (instruction === 'inp') {
  //               // console.log(alu.variables);
  //             }
  //             executeInstruction(alu, instruction as Instruction, o1, o2);
  //             // console.log(alu);
  //           }

  //           if (alu.variables.x === 0) {
  //             console.log('checking further down', firstElevenInput);
  //             times(889, step => {
  //               const fullInput = firstElevenInput + String(999 - step);
  //               if (fullInput.includes('0')) {
  //                 return;
  //               }

  //               const alu: ALU = {
  //                 variables: {},
  //                 input: fullInput.split('').map(Number),
  //               };

  //               for (const line of lines) {
  //                 const [instruction, o1, o2] = line.split(' ');
  //                 executeInstruction(alu, instruction as Instruction, o1, o2);
  //               }

  //               if (alu.variables.x === 0) {
  //                 console.log(fullInput);
  //                 console.log(alu);
  //               }

  //               if (alu.variables.x === 0 && alu.variables.z === 0) {
  //                 console.log('cool', fullInput);
  //                 console.log(alu);
  //               }
  //             });
  //           }
  //         });
  //       }
  //     });
  //   }
  // });

  return 0;
}

function part2(lines: string[]): number {
  return 0;
}

const lines = fileMapSync('src/day24/input.txt', line => line);
printSolution(part1(lines), part2(lines));
