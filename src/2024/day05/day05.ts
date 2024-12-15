import {sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Rule {
  before: number;
  after: number;
}

function isCorrect(rules: Rule[], update: number[]): boolean {
  for (const {before, after} of rules) {
    const beforeIdx = update.findIndex(p => p === before);
    const afterIdx = update.findIndex(p => p === after);

    if (beforeIdx === -1 || afterIdx === -1) {
      // n/a
      continue;
    }

    if (beforeIdx > afterIdx) {
      // fail
      return false;
    }
  }

  // every rule has passed
  return true;
}

function part1(rules: Rule[], updates: number[][]): number {
  const valid = updates.filter(update => isCorrect(rules, update));

  const middles = valid.map(update => update[Math.floor(update.length / 2)]);

  return sum(middles);
}

function fixUpdate(rules: Rule[], update: number[]): number[] {
  const pages = new Set<number>(update);
  let relevantRules = rules.filter(
    ({before, after}) => pages.has(before) && pages.has(after)
  );

  const fixedUpdate: number[] = [];

  while (relevantRules.length > 0) {
    // find a number that only exists in the 'before' section of rules
    let onlyBefore = 0;
    pagesLoop: for (const page of pages) {
      for (const rule of relevantRules) {
        if (rule.after === page) {
          continue pagesLoop;
        }
      }
      onlyBefore = page;
    }

    fixedUpdate.push(onlyBefore);

    // remove from pages and re-calculate relevant rules
    pages.delete(onlyBefore);
    relevantRules = relevantRules.filter(
      ({before, after}) => pages.has(before) && pages.has(after)
    );
  }

  return fixedUpdate;
}

function part2(rules: Rule[], updates: number[][]): number {
  const invalid = updates.filter(update => !isCorrect(rules, update));

  const valid = invalid.map(update => fixUpdate(rules, update));

  const middles = valid.map(update => update[Math.floor(update.length / 2)]);

  return sum(middles);
}

const rules: Rule[] = [];
const updates: number[][] = [];
let recordingRules = true;
fileMapSync('src/2024/day05/input.txt', line => {
  if (line === '') {
    recordingRules = false;
  } else if (recordingRules) {
    const [before, after] = line.split('|').map(Number);
    rules.push({before, after});
  } else {
    updates.push(line.split(',').map(Number));
  }
});
printSolution(part1(rules, updates), part2(rules, updates));
