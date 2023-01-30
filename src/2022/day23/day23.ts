import {cloneDeep} from 'lodash';
import {fileAsGrid} from '../../utils/file';
import {gridForEach} from '../../utils/grid';
import {PointSet} from '../../utils/pointSet';
import {printSolution} from '../../utils/printSolution';

// allAdjacentPoints indices for relevant cardinal direction groups
const AAP_N_NE_NW = [1, 2, 0];
const AAP_S_SE_SW = [6, 7, 5];
const AAP_W_NW_SW = [3, 0, 5];
const AAP_E_NE_SE = [4, 2, 7];

// simulates a round
// instruction priority
function simulateRound(elves: PointSet, instructionPriority: number[][]) {}

function part1(elves: PointSet): number {
  console.log(elves);
  return 0;
}

function part2(elves: PointSet): number {
  return 0;
}

const grid = fileAsGrid('src/2022/day23/input-small.txt');
const elves = new PointSet();
gridForEach(grid, (x, y, data) => {
  if (data === '#') {
    elves.add({x, y});
  }
});
printSolution(part1(cloneDeep(elves)), part2(cloneDeep(elves)));
