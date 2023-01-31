import {cloneDeep, times} from 'lodash';
import {fileAsGrid} from '../../utils/file';
import {
  allAdjacentPoints,
  coordString,
  fromCoordString,
  gridForEach,
  Point,
  pointsEqual,
} from '../../utils/grid';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {PointSet} from '../../utils/pointSet';
import {printSolution} from '../../utils/printSolution';
import {Range} from '../../utils/range';

// allAdjacentPoints indices for relevant cardinal direction groups
const AAP_N_NE_NW = [1, 2, 0];
const AAP_S_SE_SW = [6, 7, 5];
const AAP_W_NW_SW = [3, 0, 5];
const AAP_E_NE_SE = [4, 2, 7];

// simulates a round
// returns the number of elves that moved
function simulateRound(
  elves: PointSet,
  instructionPriority: number[][]
): number {
  // build a map with key=point value=list of elves that want to move there
  // key=preferred destination, value=list of positions of elves that want to go there
  const preferredDestinations = new MapWithDefault<string, Point[]>([]);
  // iterate through each existing elf and put its preferred destination in map
  let elvesMoved = 0;
  elves.forEach(elf => {
    const neighbors = allAdjacentPoints(elf);
    // if the elf has no neighbors, it won't move
    if (neighbors.every(n => !elves.has(n))) {
      return;
    }
    // preferred destination is the first instruction where all of its neighbor indices do not point to an elf
    // console.log(
    //   '  neighbors',
    //   neighbors,
    //   'instructionPriority',
    //   instructionPriority
    // );
    const preferredDestinationIdx = instructionPriority.find(neighborIdxs =>
      neighborIdxs.every(neighborIdx => !elves.has(neighbors[neighborIdx]))
    )?.[0];
    // console.log(
    //   '  elf',
    //   elf,
    //   'preferredDestinationIdx',
    //   preferredDestinationIdx
    // );
    let preferredDestination: Point;
    if (preferredDestinationIdx === undefined) {
      // nowhere to go, elf would like to stay put
      preferredDestination = elf;
    } else {
      // elf has a preferred destination
      preferredDestination = neighbors[preferredDestinationIdx];
    }
    const desinationMapVal = preferredDestinations.get(
      coordString(preferredDestination)
    );
    desinationMapVal.push(elf);
    preferredDestinations.set(
      coordString(preferredDestination),
      desinationMapVal
    );
  });
  // console.log('  preferred dests', preferredDestinations);
  // iterate through map and if value.length === 1, remove value and add key to pointset
  for (const [destinationStr, lads] of preferredDestinations) {
    const destination = fromCoordString(destinationStr);
    if (lads.length === 1) {
      // move the elf
      elves.delete(lads[0]);
      elves.add(destination);
      if (!pointsEqual(lads[0], destination)) {
        elvesMoved++;
      }
    }
    // else: collision! nobody moves
  }
  return elvesMoved;
}

function part1(elves: PointSet): number {
  // console.log('start', elves);
  const instructionPriority = [
    AAP_N_NE_NW,
    AAP_S_SE_SW,
    AAP_W_NW_SW,
    AAP_E_NE_SE,
  ];
  times(10, r => {
    simulateRound(elves, instructionPriority);
    const first = instructionPriority.splice(0, 1)[0];
    instructionPriority.push(first);
    // console.log('after round', r + 1, elves);
  });

  const xRange: Range = {
    min: 0,
    max: 0,
  };
  const yRange: Range = {
    min: 0,
    max: 0,
  };
  elves.forEach(elf => {
    xRange.min = Math.min(xRange.min, elf.x);
    xRange.max = Math.max(xRange.max, elf.x);
    yRange.min = Math.min(yRange.min, elf.y);
    yRange.max = Math.max(yRange.max, elf.y);
  });
  const area = (xRange.max - xRange.min + 1) * (yRange.max - yRange.min + 1);
  const emptySpaces = area - elves.size;
  // console.log('bounds', xRange, yRange, 'elves', elves.size);

  return emptySpaces;
}

function part2(elves: PointSet): number {
  // console.log('start', elves);
  const instructionPriority = [
    AAP_N_NE_NW,
    AAP_S_SE_SW,
    AAP_W_NW_SW,
    AAP_E_NE_SE,
  ];
  let elvesMoved = 1;
  let round = 0;
  while (elvesMoved > 0) {
    round++;
    elvesMoved = simulateRound(elves, instructionPriority);
    const first = instructionPriority.splice(0, 1)[0];
    instructionPriority.push(first);
    // console.log('after round', round, 'elves moved', elvesMoved);
  }

  return round;
}

const grid = fileAsGrid('src/2022/day23/input.txt');
const elves = new PointSet();
gridForEach(grid, (x, y, data) => {
  if (data === '#') {
    elves.add({x, y});
  }
});
printSolution(part1(cloneDeep(elves)), part2(cloneDeep(elves)));
