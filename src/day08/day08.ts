import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';
import {deleteAll, onlyItem} from '../utils/setUtils';

interface Line {
  patterns: Set<string>[];
  output: string[];
}

function part1(lines: Line[]): number {
  let sum = 0;
  for (const line of lines) {
    for (const note of line.output) {
      if ([2, 3, 4, 7].includes(note.length)) {
        sum++;
      }
    }
  }
  return sum;
}

const everySet = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g']);

const numbers = {
  abcefg: 0,
  cf: 1,
  acdeg: 2,
  acdfg: 3,
  bcdf: 4,
  abdfg: 5,
  abdefg: 6,
  acf: 7,
  abcdefg: 8,
  abcdfg: 9,
};

function part2(lines: Line[]): number {
  let sum = 0;
  for (const line of lines) {
    // key: segment it's lighting, value: segment it should be lighting
    const mappings = new Map<string, string>();
    // find the 1, 4, 7, and 8
    const one = line.patterns.find(pattern => pattern.size === 2)!;
    const four = line.patterns.find(pattern => pattern.size === 4)!;
    const seven = line.patterns.find(pattern => pattern.size === 3)!;
    // const eight = line.patterns.find(pattern => pattern.size === 7)!;

    // a: exists in seven but not one
    const aSet = new Set(seven);
    deleteAll(aSet, one);
    const a = onlyItem(aSet);
    mappings.set(a, 'a');

    // e: of the missing segment in each 6-segment number, it's not in one, four, or seven
    const eSet = new Set<string>();
    // add all missing segments
    for (const entry of line.patterns) {
      if (entry.size === 6) {
        const missingSet = new Set(everySet);
        deleteAll(missingSet, entry);
        eSet.add(onlyItem(missingSet));
      }
    }
    // eSet contains all the "missing" segments as of now
    for (const entry of [one, four, seven]) {
      // remove all the segments from these numbers
      deleteAll(eSet, entry);
    }
    const e = onlyItem(eSet);
    mappings.set(e, 'e');

    // three: 5-segment entry that has both one segments and no e
    // b: the other missing segment in three
    let b = '';
    let three: Set<string>;
    for (const entry of line.patterns) {
      if (entry.size === 5) {
        let hasOne = true;
        for (const segment of one) {
          if (!entry.has(segment)) {
            hasOne = false;
          }
        }
        if (!entry.has(e) && hasOne) {
          // it three
          three = entry;
          const missingSet = new Set(everySet);
          deleteAll(missingSet, entry);
          missingSet.delete(e);
          b = onlyItem(missingSet);
        }
      }
    }
    mappings.set(b!, 'b');

    // two: 5-segments, has e, doesn't have b
    // f: missing from two and not b
    let f = '';
    for (const entry of line.patterns) {
      if (entry.size === 5) {
        if (entry.has(e) && !entry.has(b)) {
          // it two
          const missingSet = new Set(everySet);
          deleteAll(missingSet, entry);
          missingSet.delete(b);
          f = onlyItem(missingSet);
        }
      }
    }
    mappings.set(f!, 'f');

    // c: in one, not f
    const cSet = new Set(one);
    cSet.delete(f);
    const c = onlyItem(cSet);
    mappings.set(c, 'c');

    // d: in four, not in one, not b
    const dSet = new Set(four);
    deleteAll(dSet, [...one, b]);
    const d = onlyItem(dSet);
    mappings.set(d, 'd');

    // g: in three, not a, c, d, f
    const gSet = new Set(three!);
    deleteAll(gSet, [a, c, d, f]);
    const g = onlyItem(gSet);
    mappings.set(g, 'g');

    // console.log(mappings);

    // mappings complete! decode
    let output = '';
    for (const entry of line.output) {
      const sorted = entry
        .split('')
        .map(char => mappings.get(char))
        .sort()
        .join('') as keyof typeof numbers;
      // console.log('sorted', sorted);
      output += `${numbers[sorted]}`;
    }
    // console.log(output);
    sum += Number(output);
  }
  return sum;
}

const lines = fileMapSync('src/day08/input.txt', line => {
  const [patterns, output] = line.split(' | ');
  return {
    patterns: patterns.split(' ').map(pattern => new Set(pattern.split(''))),
    output: output.split(' '),
  };
});
printSolution(part1(lines), part2(lines));
