import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function parseLine(line: string): number {
  const [_, dir, amtStr] = line.match(/(R|L)(\d+)/)!;
  let amt = Number(amtStr);
  if (dir === 'L') {
    amt = -amt;
  }
  return amt;
}

function part1(lines: string[]): number {
  const rots = lines.map(parseLine);

  let dial = 50;
  let zeroes = 0;

  for (const rot of rots) {
    dial += rot;
    dial %= 100;
    if (dial === 0) {
      zeroes++;
    }
  }

  return zeroes;
}

function part2(lines: string[]): number {
  const rots = lines.map(parseLine);

  let dial = 50;
  let zeroes = 0;

  for (const rot of rots) {
    if (dial === 0 && rot < 0) {
      // undo double counting when dial starts at zero
      zeroes--;
    }

    dial += rot;
    // console.log(`rotating by ${rot}, ends up at ${dial}`);

    if (dial === 0) {
      zeroes++;
    }

    while (dial > 99) {
      dial -= 100;
      zeroes++;
    }

    if (dial < 0) {
      while (dial < 0) {
        dial += 100;
        zeroes++;
      }

      // special case for left rotation ending at zero
      if (dial === 0) {
        zeroes++;
      }
    }

    // console.log(`  after fixing: ${dial}`);
    // console.log(`  zeroes: ${zeroes}`);
  }

  return zeroes;
}

const lines = fileMapSync('src/2025/day01/input.txt', line => line);
printSolution(part1(lines), part2(lines));
