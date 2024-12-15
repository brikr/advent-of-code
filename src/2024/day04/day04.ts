import {fileAsGrid, fileMapSync} from '../../utils/file';
import {
  addPoints,
  allAdjacentPoints,
  coordString,
  DIRECTION_DELTAS_ALL,
  DIRECTION_DELTAS_DIAGONALS,
  getData,
  gridForEach,
  Point,
} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';

interface State {
  point: Point;
  depth: number;
  visited: Set<string>;
}

function findXmasLine(grid: string[][], x: number, y: number): number {
  const xPoint = {x, y};

  let total = 0;

  for (const direction of Object.values(DIRECTION_DELTAS_ALL)) {
    const maybeMPoint = addPoints(xPoint, direction);
    const maybeAPoint = addPoints(maybeMPoint, direction);
    const maybeSPoint = addPoints(maybeAPoint, direction);

    if (
      getData(grid, maybeMPoint.x, maybeMPoint.y) === 'M' &&
      getData(grid, maybeAPoint.x, maybeAPoint.y) === 'A' &&
      getData(grid, maybeSPoint.x, maybeSPoint.y) === 'S'
    ) {
      total++;
    }
  }

  return total;
}

function part1(grid: string[][]): number {
  let total = 0;

  gridForEach(grid, (x, y, cell) => {
    if (cell === 'X') {
      // begin tha search
      total += findXmasLine(grid, x, y);
    }
  });

  return total;
}

function debugXmasString(grid: string[][], aPoint: Point): string {
  const upLeftPoint = addPoints(aPoint, DIRECTION_DELTAS_DIAGONALS.upLeft);
  const upRightPoint = addPoints(aPoint, DIRECTION_DELTAS_DIAGONALS.upRight);
  const downLeftPoint = addPoints(aPoint, DIRECTION_DELTAS_DIAGONALS.downLeft);
  const downRightPoint = addPoints(
    aPoint,
    DIRECTION_DELTAS_DIAGONALS.downRight
  );
  return (
    `${getData(grid, upLeftPoint.x, upLeftPoint.y)}.${getData(grid, upRightPoint.x, upRightPoint.y)}\n` +
    `.${getData(grid, aPoint.x, aPoint.y)}.\n` +
    `${getData(grid, downLeftPoint.x, downLeftPoint.y)}.${getData(grid, downRightPoint.x, downRightPoint.y)}`
  );
}

function part2(grid: string[][]): number {
  let total = 0;

  gridForEach(grid, (x, y, cell) => {
    if (cell === 'A') {
      let sCount = 0;
      let mCount = 0;
      for (const direction of Object.values(DIRECTION_DELTAS_DIAGONALS)) {
        const neighborPoint = addPoints({x, y}, direction);
        const neighbor = getData(grid, neighborPoint.x, neighborPoint.y);
        if (neighbor === 'M') {
          mCount++;
        } else if (neighbor === 'S') {
          sCount++;
        }
      }
      // if top-left and bottom-right are same, then we have a MAM/SAS crossing
      const upLeftPoint = addPoints({x, y}, DIRECTION_DELTAS_DIAGONALS.upLeft);
      const downRightPoint = addPoints(
        {x, y},
        DIRECTION_DELTAS_DIAGONALS.downRight
      );
      if (
        getData(grid, upLeftPoint.x, upLeftPoint.y) ===
        getData(grid, downRightPoint.x, downRightPoint.y)
      ) {
        return;
      }

      // otherwise, if s and m count are equal, we have an x-mas
      if (sCount === 2 && mCount === 2) {
        total++;
      }
    }
  });

  return total;
}

const grid = fileAsGrid('src/2024/day04/input.txt');
printSolution(part1(grid), part2(grid));
