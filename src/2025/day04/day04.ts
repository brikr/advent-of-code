import {fileAsGrid, fileMapSync} from '../../utils/file';
import {
  allAdjacentPoints,
  DIRECTION_DELTAS_ALL,
  gridForEach,
  isInBounds,
  pointsAround,
  printGrid,
} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';

function isAccessible(grid: string[][], x: number, y: number): boolean {
  if (grid[y][x] === '.') {
    return false;
  }

  let numRollNeighbors = 0;
  const neighborPoints = allAdjacentPoints({x, y}, true);
  for (const neighborPoint of neighborPoints) {
    if (!isInBounds(grid, neighborPoint.x, neighborPoint.y)) {
      continue;
    }

    if (grid[neighborPoint.y][neighborPoint.x] === '@') {
      numRollNeighbors++;
    }
  }

  return numRollNeighbors < 4;
}

function part1(grid: string[][]): number {
  let numAccessible = 0;

  gridForEach(grid, (x, y) => {
    if (isAccessible(grid, x, y)) {
      numAccessible++;
    }
  });

  return numAccessible;
}

function part2(grid: string[][]): number {
  let totalRemoved = 0;
  let removedThisCycle = 1;

  while (removedThisCycle > 0) {
    removedThisCycle = 0;

    gridForEach(grid, (x, y) => {
      if (isAccessible(grid, x, y)) {
        grid[y][x] = '.';
        removedThisCycle++;
      }
    });

    totalRemoved += removedThisCycle;
  }

  return totalRemoved;
}

const grid = fileAsGrid('src/2025/day04/input.txt');
printSolution(part1(grid), part2(grid));
