import {cloneDeep} from 'lodash';
import {fileAsGrid} from '../../utils/file';
import {
  coordString,
  PointWithData,
  pointsAround,
  pointsEqual,
} from '../../utils/grid';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';
import {PriorityQueue} from '../../utils/priorityQueue';
enum Space {
  EMPTY = '.',
  WALL = '#',
  AMBER = 'A',
  BRONZE = 'B',
  COPPER = 'C',
  DESERT = 'D',
}

type Creature = Space.AMBER | Space.BRONZE | Space.COPPER | Space.DESERT;

function isCreature(space: Space): space is Creature {
  return [Space.AMBER, Space.BRONZE, Space.COPPER, Space.DESERT].includes(
    space
  );
}

const MOVE_COST = {
  [Space.AMBER]: 1,
  [Space.BRONZE]: 10,
  [Space.COPPER]: 100,
  [Space.DESERT]: 1000,
};

const HOME_COL = {
  [Space.AMBER]: 3,
  [Space.BRONZE]: 5,
  [Space.COPPER]: 7,
  [Space.DESERT]: 9,
};

interface State {
  grid: Space[][];
  cost: number;
  steps: number;
  prev?: State;
}

// const TEST_STATE: State = {
//   grid: '#############\n#...B.......#\n###B#.#C#D###\n  #A#D#C#A#\n  #########'
//     .split('\n')
//     .map(line =>
//       line.split('').map(c => (c === ' ' ? Space.EMPTY : (c as Space)))
//     ),
//   steps: 0,
//   cost: 0,
// };

function isFinished(state: State): boolean {
  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      if (isCreature(state.grid[y][x]) && !isHome(state, x, y)) {
        return false;
      }
    }
  }
  return true;
}

// const FINISH_STATE: State = {
//   grid: '#############\n#...........#\n###A#B#C#D###\n  #A#B#C#D#\n  #########'
//     .split('\n')
//     .map(line =>
//       line.split('').map(c => (c === ' ' ? Space.EMPTY : (c as Space)))
//     ),
//   steps: 0,
//   cost: 0,
// };

// console.log(isFinished(FINISH_STATE));

const HALLWAY_SPOTS = ['1,1', '2,1', '4,1', '6,1', '8,1', '10,1', '11,1'];

// these are all the spots where a creature would actually end their movement
const CHILLIN_SPOTS = [
  ...HALLWAY_SPOTS,
  '3,2',
  '5,2',
  '7,2',
  '9,2',
  '3,3',
  '5,3',
  '7,3',
  '9,3',
  '3,4',
  '5,4',
  '7,4',
  '9,4',
  '3,5',
  '5,5',
  '7,5',
  '9,5',
];

interface PathMatrixState {
  location: PointWithData<undefined>;
  path: PointWithData<undefined>[];
}

function pathBfs(
  start: PathMatrixState,
  finish: PathMatrixState,
  grid: Space[][]
): PathMatrixState | undefined {
  const visited = new Set<string>();
  const queue = [start];

  while (queue.length > 0) {
    const curr = queue.splice(0, 1)[0];
    if (visited.has(coordString(curr.location))) {
      continue;
    }
    visited.add(coordString(curr.location));

    if (pointsEqual(curr.location, finish.location)) {
      return curr;
    }

    const futures = [];

    const around = pointsAround(grid, curr.location.x, curr.location.y);
    for (const neighbor of around) {
      if (neighbor.data === Space.EMPTY) {
        const location = {...neighbor, data: undefined};
        const future = {
          location,
          path: [...curr.path, location],
        };
        futures.push(future);
      }
    }

    queue.push(...futures);
  }

  return undefined;
}

// key: string coordinates e.g. x1,y1;x2,y2, value: path coords
function buildPathMatrix(
  grid: Space[][],
  pathMatrix: Map<string, PointWithData<undefined>[]>
): Map<string, PointWithData<undefined>[]> {
  pathMatrix.clear();

  const emptyGrid: Space[][] = grid.map(row =>
    row.map(c => (c === Space.WALL ? Space.WALL : Space.EMPTY))
  );

  // console.log(emptyGrid);

  for (const startSpot of CHILLIN_SPOTS) {
    const [startX, startY] = startSpot.split(',').map(Number);
    if (emptyGrid[startY]?.[startX] !== Space.EMPTY) {
      // not a valid spot (probably we are in part 1)
      continue;
    }
    for (const endSpot of CHILLIN_SPOTS) {
      const [endX, endY] = endSpot.split(',').map(Number);

      if (emptyGrid[endY]?.[endX] !== Space.EMPTY) {
        // not a valid spot (probably we are in part 1)
        continue;
      }

      const startGrid = cloneDeep(emptyGrid);
      startGrid[startY][startX] = Space.AMBER;
      const startState: PathMatrixState = {
        location: {x: startX, y: startY, data: undefined},
        path: [],
      };
      const endGrid = cloneDeep(emptyGrid);
      endGrid[endY][endX] = Space.AMBER;
      const finishState: PathMatrixState = {
        location: {x: endX, y: endY, data: undefined},
        path: [],
      };

      const searchResult = pathBfs(startState, finishState, emptyGrid);
      if (searchResult) {
        const key = `${startX},${startY};${endX},${endY}`;
        pathMatrix.set(key, searchResult.path);
      }
    }
  }

  return pathMatrix;
}

function stateToString(state: State): string {
  // return JSON.stringify(state.grid);
  return state.grid.map(row => row.join('')).join('\n');
}

function isHome(state: State, creatureX: number, creatureY: number): boolean {
  const space = state.grid[creatureY][creatureX];
  if (!isCreature(space)) {
    return false;
  }
  if (creatureX !== HOME_COL[space]) {
    return false;
  }
  // they are in the correct column, so they are home if there is only walls and like-creatures below them
  for (let y = creatureY + 1; y < state.grid.length; y++) {
    if (
      state.grid[y][creatureX] !== Space.WALL &&
      state.grid[y][creatureX] !== space
    ) {
      // not same creature or wall. not home
      return false;
    }
  }
  return true;
}

// true if x, y is in *a* room (not necessarily theirs)
function isInRoom(x: number, y: number): boolean {
  return Object.values(HOME_COL).includes(x) && y > 1;
}

const HALLWAY_Y = 1;

// true if x, y is in the hallway
function isInHallway(y: number): boolean {
  return y === HALLWAY_Y;
}

interface Future {
  state: State;
  moveCost: number;
}

function getFuturesForCreature2(
  prev: State,
  creatureX: number,
  creatureY: number,
  creature: Creature
): Future[] {
  const futureLocations: PointWithData<undefined>[] = [];

  // 3 states a creature could be in:
  if (isInRoom(creatureX, creatureY) && !isHome(prev, creatureX, creatureY)) {
    // they are in a room and not home (not their room or non-alike creatures below them)
    //    in this case, all available hallway spots are valid moves
    for (const hallwaySpot of HALLWAY_SPOTS) {
      const [x, y] = hallwaySpot.split(',').map(Number);
      if (prev.grid[y][x] === Space.EMPTY) {
        futureLocations.push({x, y: HALLWAY_Y, data: undefined});
      }
    }
  } else if (isInHallway(creatureY)) {
    // they are in the hallway
    //    in this case, their lowest home room spot is the only valid move
    for (let y = prev.grid.length - 1; y > HALLWAY_Y; y--) {
      const space = prev.grid[y][HOME_COL[creature]];
      if (space === Space.WALL || space === creature) {
        // no biggie
        continue;
      } else if (space === Space.EMPTY) {
        // choice
        futureLocations.push({x: HOME_COL[creature], y, data: undefined});
        break;
      } else {
        // looks like someone else is still staying here. we don't want to try to move in yet.
        break;
      }
    }
  }
  // else they are home and there are no move sto make

  const futures: Future[] = [];

  futureLocation: for (const {x, y} of futureLocations) {
    // first, figure out how big the move is
    const path = PATH_MATRIX.get(`${creatureX},${creatureY};${x},${y}`);
    if (!path) {
      // this shouldn't happen
      console.log(prev, creature, creatureX, creatureY, x, y);
      throw 'wtf';
    }
    // make sure the path isn't obstructed
    for (const cell of path) {
      if (prev.grid[cell.y][cell.x] !== Space.EMPTY) {
        // no path; don't try to go to this spot
        continue futureLocation;
      }
    }

    // path is good; find the cost
    const moveCost = path.length * MOVE_COST[creature];

    // make tha future
    const grid = cloneDeep(prev.grid);
    grid[creatureY][creatureX] = Space.EMPTY;
    grid[y][x] = creature;
    const state: State = {
      grid,
      cost: prev.cost + moveCost,
      steps: prev.steps + 1,
      prev,
    };
    const future: Future = {
      state,
      moveCost,
    };
    futures.push(future);
  }

  return futures;
}

function getFutures(state: State): Future[] {
  const futures: Future[] = [];

  const creatures: PointWithData<Creature>[] = [];

  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      const space = state.grid[y][x];
      if (isCreature(space)) {
        if (isHome(state, x, y)) {
          // don't get futures for a bug that's home
          continue;
        }
        creatures.push({x, y, data: space});
      }
    }
  }

  for (const creature of creatures) {
    const around = getFuturesForCreature2(
      state,
      creature.x,
      creature.y,
      creature.data
    );
    futures.push(...around);
  }

  // console.log('  futures', futures.length);

  return futures;
}

function aStar(start: State): number {
  function heuristicScore(state: State): number {
    let score = 0;
    for (let y = 0; y < state.grid.length; y++) {
      for (let x = 0; x < state.grid[y].length; x++) {
        const space = state.grid[y][x];
        if (isCreature(space)) {
          if (!isHome(state, x, y)) {
            const homeBackWall = {x: HOME_COL[space], y: state.grid.length - 2};
            const distance =
              PATH_MATRIX.get(`${x},${y};${homeBackWall.x},${homeBackWall.y}`)
                ?.length ?? 0;
            score += (distance * MOVE_COST[space]) / 2;
          }
        }
      }
    }
    return score;
    // return 0;
  }

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  const fScore = new MapWithDefault<string, number>(Infinity);

  function aMoreImportantThanB(a: State, b: State): boolean {
    return fScore.get(stateToString(a)) < fScore.get(stateToString(b));
  }

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  const openQueue = new PriorityQueue<State>(aMoreImportantThanB);
  const openSet = new Set<string>();
  openQueue.push(start);
  openSet.add(stateToString(start));

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  // might not actually need this
  // key: point, value: point
  const cameFrom = new Map<string, string>();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  // key: point, value: cheapest path
  const gScore = new MapWithDefault<string, number>(Infinity);
  gScore.set(stateToString(start), 0);

  fScore.set(stateToString(start), heuristicScore(start));

  while (openQueue.size > 0) {
    const curr = openQueue.dequeue();
    openSet.delete(stateToString(curr));

    // console.log(
    //   'checking',
    //   'g',
    //   gScore.get(stateToString(curr)),
    //   'f',
    //   fScore.get(stateToString(curr)),
    //   'steps',
    //   curr.steps
    // );
    // console.log(stateToString(curr));

    if (isFinished(curr)) {
      // we did it
      // console.log(gScore);
      // console.log(cameFrom);
      return gScore.get(stateToString(curr));
    }

    const futures = getFutures(curr);
    for (const future of futures) {
      // tentative_gScore is the distance from start to the neighbor through current
      const tentativeGScore = gScore.get(stateToString(curr)) + future.moveCost;
      // console.log(
      //   '  checking neighbor',
      //   neighbor,
      //   'g',
      //   gScore.get(coordString(neighbor)),
      //   'tentative',
      //   tentativeGScore
      // );

      if (tentativeGScore < gScore.get(stateToString(future.state))) {
        // This path to neighbor is better than any previous one. Record it!
        // console.log(
        //   '    recordin',
        //   'g',
        //   tentativeGScore,
        //   'f',
        //   tentativeGScore + heuristicScore(neighbor)
        // );
        cameFrom.set(stateToString(future.state), stateToString(curr));
        gScore.set(stateToString(future.state), tentativeGScore);
        fScore.set(
          stateToString(future.state),
          tentativeGScore + heuristicScore(future.state)
        );

        if (!openSet.has(stateToString(future.state))) {
          // console.log('    enqueuein');
          openQueue.push(future.state);
          openSet.add(stateToString(future.state));
        }
      }
    }
  }

  // woops
  return -1;
}

function part1(grid: Space[][]): number {
  const initialState: State = {
    grid,
    cost: 0,
    steps: 0,
  };

  buildPathMatrix(grid, PATH_MATRIX);

  const result = aStar(initialState);

  return result;
}

function part2(grid: Space[][]): number {
  const newRows = [
    [
      Space.EMPTY,
      Space.EMPTY,
      Space.WALL,
      Space.DESERT,
      Space.WALL,
      Space.COPPER,
      Space.WALL,
      Space.BRONZE,
      Space.WALL,
      Space.AMBER,
      Space.WALL,
    ],
    [
      Space.EMPTY,
      Space.EMPTY,
      Space.WALL,
      Space.DESERT,
      Space.WALL,
      Space.BRONZE,
      Space.WALL,
      Space.AMBER,
      Space.WALL,
      Space.COPPER,
      Space.WALL,
    ],
  ];

  grid.splice(3, 0, ...newRows);

  const initialState: State = {
    grid,
    cost: 0,
    steps: 0,
  };

  buildPathMatrix(grid, PATH_MATRIX);

  // for (const [key, value] of PATH_MATRIX) {
  //   console.log('path', key, value.length);
  // }

  const result = aStar(initialState);

  return result;
}

const grid = fileAsGrid<Space>('src/2021/day23/input.txt', c =>
  c === ' ' ? Space.EMPTY : (c as Space)
);
const PATH_MATRIX = new Map<string, PointWithData<undefined>[]>();
printSolution(part1(grid), part2(grid));
