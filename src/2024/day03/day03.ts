import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function part1(lines: string[]): number {
  let total = 0;

  for (const line of lines) {
    const matches = line.matchAll(/mul\((\d+),(\d+)\)/g);
    for (const match of matches) {
      const o1 = Number(match[1]);
      const o2 = Number(match[2]);

      total += o1 * o2;
    }
  }

  return total;
}

function part2(lines: string[]): number {
  let total = 0;

  // there's no instructions that cross line boundaries in my input. maybe lucky?
  const fullInput = lines.join('');

  const mulMatches = Array.from(fullInput.matchAll(/mul\((\d+),(\d+)\)/g));
  const doMatches = Array.from(fullInput.matchAll(/do\(\)/g));
  const dontMatches = Array.from(fullInput.matchAll(/don\'t\(\)/g));

  const allInstructions = [...mulMatches, ...doMatches, ...dontMatches].sort(
    (a, b) => a.index - b.index
  );

  let enabled = true;
  for (const instruction of allInstructions) {
    if (instruction[0].startsWith('don')) {
      enabled = false;
    } else if (instruction[0].startsWith('do')) {
      enabled = true;
    } else if (enabled) {
      // mul && enabled
      total += Number(instruction[1]) * Number(instruction[2]);
    }
  }

  return total;
}

const lines = fileMapSync('src/2024/day03/input.txt', line => line);
printSolution(part1(lines), part2(lines));
