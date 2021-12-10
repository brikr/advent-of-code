import {last} from 'lodash';
import {fileMapSync} from '../utils/file';
import {median} from '../utils/median';
import {printSolution} from '../utils/printSolution';

const OPENER = {
  ')': '(',
  ']': '[',
  '}': '{',
  '>': '<',
};

const P1_POINTS = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};

const P2_POINTS = {
  '(': 1,
  '[': 2,
  '{': 3,
  '<': 4,
};

type Opener = '(' | '[' | '{' | '<';

function part1(lines: string[]): number {
  let sum = 0;
  for (const line of lines) {
    const chars = line.split('');
    const stack: Opener[] = [];
    line: for (const char of chars) {
      switch (char) {
        case '(':
        case '[':
        case '{':
        case '<':
          // starting a new chunk. this is always legal
          stack.push(char);
          break;
        case ')':
        case ']':
        case '}':
        case '>':
          // closing a chunk. top of stack needs to match the closer
          if (last(stack) === OPENER[char]) {
            // happy close
            stack.pop();
          } else {
            // error: unexpected closer
            // console.log('error in ', line);
            // console.log('unexpected', char, 'at', idx);
            // console.log(stack);
            sum += P1_POINTS[char];
            break line;
          }
          break;
        default:
          console.log('wtf');
          return -1;
      }
    }
    if (stack.length > 0) {
      // this line is incomplete
    }
  }
  return sum;
}

function part2(lines: string[]): number {
  const scores = [];
  lines: for (const line of lines) {
    const chars = line.split('');
    const stack: Opener[] = [];
    for (const char of chars) {
      switch (char) {
        case '(':
        case '[':
        case '{':
        case '<':
          // starting a new chunk. this is always legal
          stack.push(char);
          break;
        case ')':
        case ']':
        case '}':
        case '>':
          // closing a chunk. top of stack needs to match the closer
          if (last(stack) === OPENER[char]) {
            // happy close
            stack.pop();
          } else {
            // error: unexpected closer
            continue lines;
          }
          break;
        default:
          console.log('wtf');
          return -1;
      }
    }
    if (stack.length > 0) {
      // this line is incomplete
      stack.reverse();
      // console.log('incomplete', line);
      // console.log(stack.join(''));
      let score = 0;
      for (const char of stack) {
        score *= 5;
        score += P2_POINTS[char];
      }
      // console.log(score);
      scores.push(score);
    }
  }

  return median(scores);
}

const lines = fileMapSync('src/day10/input.txt', line => line);
printSolution(part1(lines), part2(lines));
