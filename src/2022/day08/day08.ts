import {every} from 'lodash';
import {fileAsGrid} from '../../utils/file';
import {getCol, getRow, gridForEach, isEdge} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';

function part1(grid: number[][]): number {
  let count = 0;

  gridForEach(grid, (x, y, height) => {
    if (isEdge(grid, x, y)) {
      // edges are visible
      // console.log(`${x},${y}: visible`);
      count++;
    } else {
      // paths to edge
      const row = getRow(grid, y);
      const col = getCol(grid, x);

      const left = row.slice(0, x);
      const right = row.slice(x + 1);
      const up = col.slice(0, y);
      const down = col.slice(y + 1);

      if (
        every(up, t => t < height) ||
        every(down, t => t < height) ||
        every(left, t => t < height) ||
        every(right, t => t < height)
      ) {
        // every tree is lower, so it's visible
        // console.log(`${x},${y}: visible`);
        count++;
      } else {
        // console.log(`${x},${y}: not visible`);
      }
    }
  });

  return count;
}

function part2(grid: number[][]): number {
  let bestScore = 0;

  gridForEach(grid, (x, y, height) => {
    const row = getRow(grid, y);
    const col = getCol(grid, x);

    // the view in each direction, originating from the tree
    const left = row.slice(0, x).reverse();
    const right = row.slice(x + 1);
    const up = col.slice(0, y).reverse();
    const down = col.slice(y + 1);

    const score = [up, down, left, right].reduce((acc, view) => {
      let distance = view.findIndex(t => t >= height) + 1;

      if (distance === 0) {
        // we saw all the way, maximum view
        distance = view.length;
      }

      return acc * distance;
    }, 1);

    if (score > bestScore) {
      bestScore = score;
    }
  });

  return bestScore;
}

const grid = fileAsGrid('src/2022/day08/input.txt', Number);
printSolution(part1(grid), part2(grid));
