import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

function pointsAround(map: number[][], x: number, y: number): number[] {
  const up = map[y - 1]?.[x];
  const down = map[y + 1]?.[x];
  const left = map[y][x - 1];
  const right = map[y][x + 1];
  return [up, down, left, right].filter(p => p !== undefined);
}

function part1(map: number[][]): number {
  // key: string x,y of point
  const lowPoints = new Set<string>();
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (pointsAround(map, x, y).every(pointValue => pointValue > map[y][x])) {
        // console.debug('low', `${x},${y}`, pointsAround(map, x, y));
        lowPoints.add(`${x},${y}`);
      }
    }
  }

  // console.log(lowPoints);

  let sum = 0;
  for (const point of lowPoints) {
    const [x, y] = point.split(',').map(Number);
    // console.debug('low', x, y, map[y][x]);
    sum += map[y][x] + 1;
  }
  return sum;
}

function coordsAround(map: number[][], x: number, y: number): string[] {
  const around = [];
  // up
  if (map[y - 1]?.[x] !== undefined) {
    around.push(`${x},${y - 1}`);
  }
  // down
  if (map[y + 1]?.[x] !== undefined) {
    around.push(`${x},${y + 1}`);
  }
  // left
  if (map[y][x - 1] !== undefined) {
    around.push(`${x - 1},${y}`);
  }
  // right
  if (map[y][x + 1] !== undefined) {
    around.push(`${x + 1},${y}`);
  }
  return around;
}

function part2(map: number[][]): number {
  // key: string x,y of point
  const lowPoints = new Set<string>();
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (pointsAround(map, x, y).every(pointValue => pointValue > map[y][x])) {
        // console.debug('low', `${x},${y}`, pointsAround(map, x, y));
        lowPoints.add(`${x},${y}`);
      }
    }
  }

  // console.log(lowPoints);

  const basinSizes: number[] = [];
  for (const point of lowPoints) {
    // fill tha basin
    const basin = new Set<string>();
    // explore stack
    const toExplore: string[] = [point];

    while (toExplore.length > 0) {
      const next = toExplore.pop()!;
      const [x, y] = next.split(',').map(Number);
      // console.log(x, y);
      if (!basin.has(next) && map[y][x] !== 9) {
        // unexplored and not an edge. add to basin and explore around it
        basin.add(next);
        const around = coordsAround(map, x, y);
        toExplore.push(...around);
      }
    }
    // console.log('basin', basin.size, basin);
    basinSizes.push(basin.size);
  }

  const topThree = basinSizes.sort((a, b) => a - b).slice(-3);

  return topThree.reduce((acc, cur) => acc * cur);
}

const map = fileMapSync('src/day09/input.txt', line =>
  line.split('').map(Number)
);
printSolution(part1(map), part2(map));
