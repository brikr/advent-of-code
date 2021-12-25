import {cloneDeep} from 'lodash';
import {fileAsGrid, fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

enum Space {
  DOWNCUMBER = 'v',
  RIGHTCUMBER = '>',
  EMPTY = '.',
}

function gridAsString(grid: Space[][]): string {
  return grid.map(row => row.join('')).join('\n');
}

interface AdvanceResult {
  grid: Space[][];
  changed: boolean;
}

function advance(grid: Space[][]): AdvanceResult {
  const rightGrid = cloneDeep(grid);
  let changed = false;

  // right cumbers
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const space = grid[y][x];
      if (space === Space.RIGHTCUMBER) {
        const rightX = (x + 1) % grid[y].length;
        if (grid[y][rightX] === Space.EMPTY) {
          // move that mf
          rightGrid[y][rightX] = Space.RIGHTCUMBER;
          rightGrid[y][x] = Space.EMPTY;
          changed = true;
        }
      }
    }
  }

  const downGrid = cloneDeep(rightGrid);

  // downcumbers
  for (let y = 0; y < rightGrid.length; y++) {
    for (let x = 0; x < rightGrid[y].length; x++) {
      const space = rightGrid[y][x];
      if (space === Space.DOWNCUMBER) {
        const downY = (y + 1) % rightGrid.length;
        if (rightGrid[downY][x] === Space.EMPTY) {
          // move that mf
          downGrid[downY][x] = Space.DOWNCUMBER;
          downGrid[y][x] = Space.EMPTY;
          changed = true;
        }
      }
    }
  }

  return {
    grid: downGrid,
    changed,
  };
}

function part1(start: Space[][]): number {
  // console.log('Initial');
  // console.log(gridAsString(start));

  let grid = start;

  let changed = true;
  let step = 0;
  while (changed) {
    step++;
    const next = advance(grid);
    grid = next.grid;
    changed = next.changed;

    // console.log(`after ${step} steps`);
    // console.log(gridAsString(grid));
  }

  return step;
}

function part2(start: Space[][]): number {
  return 0;
}

const grid = fileAsGrid('src/day25/input.txt', c => c as Space);
printSolution(part1(grid), part2(grid));
