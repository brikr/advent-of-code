import {sum} from 'lodash';
import {transpose} from '../../utils/array';
import {fileLines, fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {product} from '../../utils/math';

type Operator = '+' | '*';
interface Problem {
  operands: number[];
  operator: Operator;
}

function solve({operator, operands}: Problem): number {
  if (operator === '+') {
    return sum(operands);
  } else {
    return product(operands);
  }
}

function part1(lines: string[]): number {
  const split = lines.map(line => line.split(' ').filter(Boolean));
  const transposed = transpose(split);
  const problems = transposed.map(input => {
    const operator = input.at(-1);
    const operands = input.slice(0, -1).map(Number);
    return {
      operands,
      operator,
    } as Problem;
  });

  return sum(problems.map(solve));
}

function part2(lines: string[]): number {
  const digits = lines.map(line => line.split(''));
  const transposed = transpose(digits);

  const problems: Problem[] = [];
  let currentProblem: Problem = {
    operator: '+', // tmp
    operands: [],
  };
  for (const column of transposed) {
    // fully empty column: currentProblem is complete
    if (column.every(d => d === ' ')) {
      problems.push(currentProblem);
      currentProblem = {
        operator: '+', // tmp
        operands: [],
      };
      continue;
    }

    const maybeOperator = column.at(-1);
    if (maybeOperator !== ' ') {
      currentProblem.operator = maybeOperator as Operator;
    }

    const operand = Number(column.slice(0, -1).join(''));
    currentProblem.operands.push(operand);
  }
  // push the final problem
  problems.push(currentProblem);

  return sum(problems.map(solve));
}

const lines = fileLines('src/2025/day06/input.txt');
printSolution(part1(lines), part2(lines));
