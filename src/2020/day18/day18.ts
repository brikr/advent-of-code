import {sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function isDigit(digit: string) {
  return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(digit);
}

function isOperator(op: string) {
  return ['+', '*'].includes(op);
}

function infixToPostfix(infix: string) {
  // reversing string makes our postfix tree evaluate left to right :thinking_face:
  const reversed = infix
    .split('')
    .reverse()
    .join('')
    .replace(/\(/g, 'x')
    .replace(/\)/g, '(')
    .replace(/x/g, ')');
  console.log(`debug: ${reversed}`);

  let outputQueue = '';
  const operatorStack = [];
  const infixArr = reversed
    .replace(/\s+/g, '')
    .split(/([+*()])/)
    .filter(char => char !== '');

  for (const char of infixArr) {
    if (isDigit(char)) {
      outputQueue += char + ' ';
    } else if (isOperator(char)) {
      operatorStack.push(char);
    } else if (char === '(') {
      operatorStack.push(char);
    } else if (char === ')') {
      while (operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue += operatorStack.pop() + ' ';
      }
      operatorStack.pop();
    }
  }

  while (operatorStack.length > 0) {
    outputQueue += operatorStack.pop() + ' ';
  }

  return outputQueue;
}

function solvePostfix(equation: string): number {
  const stack: number[] = [];

  for (const char of equation.trim().split(' ')) {
    if (isDigit(char)) {
      stack.push(Number(char));
    } else if (isOperator(char)) {
      const left = stack.pop()!;
      const right = stack.pop()!;
      if (char === '+') {
        stack.push(left + right);
      } else {
        stack.push(left * right);
      }
    }
  }

  return stack.pop()!;
}

function part1(): number {
  const answers = fileMapSync('src/2020/day18/input.txt', line => {
    if (line === '') {
      return 0;
    }

    console.log(`Infix: ${line}`);
    const postfix = infixToPostfix(line);
    console.log(`Postfix: ${postfix}`);
    const solution = solvePostfix(postfix);
    console.log(`Answer: ${solution}`);

    return solution;
  });

  return sum(answers);
}

function infixToPostfixWithPrecedence(infix: string) {
  // reversing string makes our postfix tree evaluate left to right :thinking_face:
  const reversed = infix
    .split('')
    .reverse()
    .join('')
    .replace(/\(/g, 'x')
    .replace(/\)/g, '(')
    .replace(/x/g, ')');
  console.log(`debug: ${reversed}`);

  let outputQueue = '';
  const operatorStack = [];
  const infixArr = reversed
    .replace(/\s+/g, '')
    .split(/([+*()])/)
    .filter(char => char !== '');

  for (const char of infixArr) {
    if (isDigit(char)) {
      outputQueue += char + ' ';
    } else if (isOperator(char)) {
      if (char === '*') {
        // if it's *, enqueue any + on top of op stack
        let top = operatorStack[operatorStack.length - 1];
        while (top === '+') {
          outputQueue += operatorStack.pop() + ' ';
          top = operatorStack[operatorStack.length - 1];
        }
      }

      operatorStack.push(char);
    } else if (char === '(') {
      operatorStack.push(char);
    } else if (char === ')') {
      while (operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue += operatorStack.pop() + ' ';
      }
      operatorStack.pop();
    }
  }

  while (operatorStack.length > 0) {
    outputQueue += operatorStack.pop() + ' ';
  }

  return outputQueue;
}

function part2(): number {
  const answers = fileMapSync('src/2020/day18/input.txt', line => {
    if (line === '') {
      return 0;
    }

    console.log(`Infix: ${line}`);
    const postfix = infixToPostfixWithPrecedence(line);
    console.log(`Postfix: ${postfix}`);
    const solution = solvePostfix(postfix);
    console.log(`Answer: ${solution}`);

    return solution;
  });

  return sum(answers);
}

printSolution(part1(), part2());
