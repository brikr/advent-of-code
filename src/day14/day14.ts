import {max, min, minBy, replace, times} from 'lodash';
import {fileLines, fileMapSync} from '../utils/file';
import {MapWithDefault} from '../utils/mapWithDefault';
import {printSolution} from '../utils/printSolution';

interface Replacement {
  pair: string;
  insert: string;
}

interface Input {
  template: string;
  replacements: Replacement[];
}

function doReplacementsOnce(
  template: string,
  replacements: Replacement[]
): string {
  let ret = template;
  for (const {pair, insert} of replacements) {
    const to = `${pair[0]}_${insert}_${pair[1]}`;
    const pairRx = new RegExp(pair, 'g');
    let length = ret.length;
    let lastLength = 0;
    // keep replacing until a replacement doesn't happen
    while (lastLength !== length) {
      lastLength = length;
      ret = ret.replace(pairRx, to);
      length = ret.length;
    }
    // console.log(pair, ret);
  }
  return ret.replace(/_/g, '');
}

function getScore(template: string): number {
  const map = new MapWithDefault<string, number>(0);
  for (const char of template) {
    const count = map.get(char);
    map.set(char, count + 1);
  }

  // console.log(map);

  const lowest = min(Array.from(map.values()))!;
  const highest = max(Array.from(map.values()))!;

  return highest - lowest;
}

function part1({template, replacements}: Input): number {
  // console.log(template, replacements);

  let final = template;

  times(10, step => {
    final = doReplacementsOnce(final, replacements);
    // console.log(`After step ${step + 1}: `, final);
  });

  return getScore(final);
}

function part2({template, replacements}: Input): number {
  let pairMap = new MapWithDefault<string, number>(0);

  // key: pair, value: two new pairs (after insertion)
  const replacementMap = new Map<string, string[]>();

  // build replacement map
  for (const {pair, insert} of replacements) {
    const pairOne = `${pair[0]}${insert}`;
    const pairTwo = `${insert}${pair[1]}`;
    replacementMap.set(pair, [pairOne, pairTwo]);
  }

  // build initial pair map
  for (let i = 0; i < template.length - 1; i++) {
    const pair = template.slice(i, i + 2);
    pairMap.set(pair, pairMap.get(pair) + 1);
  }

  // console.log('pairs', pairMap);
  // console.log('replacements', replacementMap);

  times(40, step => {
    const newPairMap = new MapWithDefault<string, number>(0);
    for (const [from, to] of replacementMap) {
      if (pairMap.has(from)) {
        const fromCount = pairMap.get(from);
        // console.log('replacing', from, 'with', to, fromCount, 'times');
        // omit adding the 'from' to the newPair map as we are replacing all instances
        // increment the newPairs by new map count + fromCount
        newPairMap.set(to[0], newPairMap.get(to[0]) + fromCount);
        newPairMap.set(to[1], newPairMap.get(to[1]) + fromCount);

        // console.log(newPairMap);
      }
    }

    pairMap = newPairMap;
    // console.log(`After ${step + 1} steps: `, pairMap);
  });

  // get totals
  // key: char, value: count
  const totals = new MapWithDefault<string, number>(0);

  for (const [pair, count] of pairMap) {
    const [charA, charB] = pair;
    totals.set(charA, totals.get(charA) + count);
    totals.set(charB, totals.get(charB) + count);
  }

  // find highest and lowest
  let highest = 0;
  let lowest = Infinity;
  for (const [char, total] of totals) {
    // everything was counted twice except first and last char
    const realCount = Math.ceil(total / 2);

    totals.set(char, realCount);

    highest = max([highest, realCount])!;
    lowest = min([lowest, realCount])!;
  }

  // console.log(totals, highest, lowest);

  return highest - lowest;
}

const lines = fileLines('src/day14/input.txt');

const input = {
  template: lines[0],
  replacements: lines.slice(2).map(line => {
    const [pair, insert] = line.split(' -> ');
    return {pair, insert};
  }),
};

printSolution(part1(input), part2(input));
