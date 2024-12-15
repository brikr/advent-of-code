import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function isSafe(report: number[]): boolean {
  let increasing = true;
  for (const [idx, level] of report.entries()) {
    if (idx === 0) continue;

    const prev = report[idx - 1];

    if (idx === 1) {
      increasing = level > prev;
    }

    if ((increasing && level <= prev) || (!increasing && level >= prev)) {
      // not safe
      return false;
    }

    const diff = Math.abs(level - prev);
    if (diff < 1 || diff > 3) {
      // not safe
      return false;
    }
  }
  // safe
  return true;
}

function part1(reports: number[][]): number {
  return reports.filter(isSafe).length;
}

function part2(reports: number[][]): number {
  let total = 0;

  reportsLoop: for (const [reportsIdx, report] of reports.entries()) {
    if (isSafe(report)) {
      total++;
      continue;
    }

    // try variations to see if any of them are safe
    for (const [levelIdx, level] of report.entries()) {
      const copy = [...report];
      copy.splice(levelIdx, 1);

      if (isSafe(copy)) {
        total++;
        continue reportsLoop;
      }
    }
  }

  return total;
}

const reports = fileMapSync('src/2024/day02/input.txt', line =>
  line.split(' ').map(Number)
);
printSolution(part1(reports), part2(reports));
