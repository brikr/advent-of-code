import {fileMapSync} from '../../utils/file';

const WINDOW_SIZE = 25;

function canMakeSum(array: number[], value: number): boolean {
  const set = new Set(array);
  for (const num of array) {
    if (set.has(value - num)) {
      return true;
    }
  }
  return false;
}

function part1(): number {
  const numbers = fileMapSync('src/2020/day09/input.txt', line => Number(line));
  const rollingWindow = numbers.slice(0, WINDOW_SIZE);

  let idx = WINDOW_SIZE;
  while (idx < numbers.length) {
    if (canMakeSum(rollingWindow, numbers[idx])) {
      rollingWindow.splice(0, 1);
      rollingWindow.push(numbers[idx]);
      idx++;
    } else {
      return numbers[idx];
    }
  }

  return numbers[idx];
}

function sumRange(array: number[], start: number, end: number) {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += array[i];
  }
  return sum;
}

function part2(): number {
  const numbers = fileMapSync('src/2020/day09/input.txt', line => Number(line));
  const numToFind = part1();

  let start = 0;
  let end = 1;
  let sum = sumRange(numbers, start, end);
  while (sum !== numToFind) {
    if (sum > numToFind) {
      // shrink the window
      start++;
    } else {
      // grow the window
      end++;
    }

    // make sure end is after start
    if (end <= start) {
      end = start + 1;
    }
    sum = sumRange(numbers, start, end);
  }

  // find smallest and largest in the range
  let smallest = numbers[start];
  let largest = numbers[start];
  for (let i = start + 1; i <= end; i++) {
    if (numbers[i] < smallest) {
      smallest = numbers[i];
    }

    if (numbers[i] > largest) {
      largest = numbers[i];
    }
  }

  return smallest + largest;
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
}

printSolution();
