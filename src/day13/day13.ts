import {max, sum, sumBy} from 'lodash';
import {transpose} from '../utils/array';
import {fileLines} from '../utils/file';
import {printSolution} from '../utils/printSolution';

type Xy = 'x' | 'y';

interface Fold {
  along: Xy;
  coord: number;
}

interface Input {
  map: boolean[][]; // row major
  folds: Fold[];
}

function printMap(map: boolean[][]) {
  for (let y = 0; y < map.length; y++) {
    console.log(map[y].map(s => (s ? '#' : '.')).join(''));
  }
  console.log('Dots:', howManyDots(map));
}

function howManyDots(map: boolean[][]): number {
  return sum(map.map(row => sumBy(row, dot => (dot ? 1 : 0))));
}

function getCompliment(num: number, foldPoint: number) {
  if (num >= foldPoint) {
    throw 'wtf';
  }
  const diff = foldPoint - num;
  return num + diff * 2;
}

function doFold(map: boolean[][], fold: Fold): boolean[][] {
  if (fold.along === 'y') {
    // being cheeky and transposing before/after for fold along y, so rest of function can just worry about x folds
    map = transpose(map);
  }
  let newMap: boolean[][] = [];

  for (let y = 0; y < map.length; y++) {
    newMap[y] = [];
    for (let x = 0; x < fold.coord; x++) {
      const compliment = getCompliment(x, fold.coord);
      newMap[y][x] = map[y][x] || map[y][compliment];
    }
  }

  if (fold.along === 'y') {
    newMap = transpose(newMap);
  }
  return newMap;
}

function part1(input: Input): number {
  let {map} = input;
  // console.log('Initial:');
  // printMap(map);
  // do the first fold
  map = doFold(map, input.folds[0]);
  // console.log('After first fold:');
  // printMap(map);
  return howManyDots(map);
}

function part2(input: Input): string {
  let {map} = input;
  for (const fold of input.folds) {
    map = doFold(map, fold);
  }
  printMap(map);
  return 'Read the paper 👆';
}

const lines = fileLines('src/day13/input.txt');
let readingFolds = false;
const input: Input = {
  map: [],
  folds: [],
};
const highestSeen = {
  x: 0,
  y: 0,
};
for (const line of lines) {
  if (line === '') {
    // coord input done. now reading folds
    readingFolds = true;
    continue;
  }

  if (readingFolds) {
    const match = line.match(/([xy])=(\d+)/)!;
    const along = match[1] as Xy;
    const coord = Number(match[2]);
    input.folds.push({along, coord});
  } else {
    const [x, y] = line.split(',').map(Number);
    input.map[y] ||= [];
    input.map[y][x] = true;
    highestSeen.y = max([y, highestSeen.y])!;
    highestSeen.x = max([x, highestSeen.x])!;
  }
}
// fill the input map with false in all unmarked spots
for (let y = 0; y <= highestSeen.y; y++) {
  input.map[y] ||= [];
  for (let x = 0; x <= highestSeen.x; x++) {
    input.map[y][x] ||= false;
  }
}
printSolution(part1(input), part2(input));
