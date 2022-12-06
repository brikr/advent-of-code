import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function priority(char: string): number {
  if (char >= 'a') {
    // lowercase
    return char.charCodeAt(0) - 96;
  } else {
    // uppercase
    return char.charCodeAt(0) - 38;
  }
}

function part1(lines: string[]): number {
  let total = 0;

  for (const line of lines) {
    const firstHalf = line.substring(0, line.length / 2);
    const secondHalf = line.substring(line.length / 2);

    const firstCompartment = new Set(firstHalf.split(''));

    for (const item of secondHalf.split('')) {
      if (firstCompartment.has(item)) {
        // console.log(line, 'shared:', item);
        total += priority(item);
        break;
      }
    }
  }
  return total;
}

function part2(lines: string[]): number {
  let total = 0;

  for (let i = 0; i < lines.length; i += 3) {
    const first = lines[i];
    const second = lines[i + 1];
    const third = lines[i + 2];

    const firstSet = new Set(first.split(''));
    const secondSet = new Set(second.split(''));

    for (const item of third.split('')) {
      if (firstSet.has(item) && secondSet.has(item)) {
        // badge
        total += priority(item);
        break;
      }
    }
  }
  return total;
}

const lines = fileMapSync('src/2022/day03/input.txt', line => line);
printSolution(part1(lines), part2(lines));
