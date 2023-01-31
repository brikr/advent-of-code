import {printSolution} from '../../utils/printSolution';

const INPUT = '2,0,1,9,5,19';
// const INPUT = '0,3,6';

function logHistory(
  history: {[key: number]: number[]},
  num: number,
  idx: number
) {
  if (history[num] !== undefined) {
    history[num] = [history[num][history[num].length - 1], idx];
  } else {
    history[num] = [idx];
  }
}

function part1(nth: number): number {
  const input = INPUT.split(',').map(Number);

  const spokenHistory: {[key: number]: number[]} = {};
  let lastNumber = 0;

  // start with the input
  for (let i = 0; i < input.length; i++) {
    logHistory(spokenHistory, input[i], i);
    lastNumber = input[i];
    // console.log(`${i} (${lastNumber})`);
    // console.log(spokenHistory);
  }

  // go to 2020
  for (let i = input.length; i < nth; i++) {
    if (spokenHistory[lastNumber].length > 1) {
      const history = spokenHistory[lastNumber];
      lastNumber = history[history.length - 1] - history[history.length - 2];
    } else {
      lastNumber = 0;
    }
    logHistory(spokenHistory, lastNumber, i);
    console.log(`${i} (${lastNumber})`);
    // console.log(spokenHistory);
  }

  return lastNumber;
}

printSolution(part1(2020), part1(30000000));
