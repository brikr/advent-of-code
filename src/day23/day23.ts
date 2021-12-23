import {cloneDeep, initial} from 'lodash';
import {fileAsGrid, fileMapSync} from '../utils/file';
import {Point, pointsAround} from '../utils/grid';
import {MapWithDefault} from '../utils/mapWithDefault';
import {printSolution} from '../utils/printSolution';
import {SortedQueue} from '../utils/sortedQueue';

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

type DistanceData = {
  [key in Creature]: number;
};
const DISTANCE_MAP = new MapWithDefault<string, DistanceData>({
  [Space.AMBER]: Infinity,
  [Space.BRONZE]: Infinity,
  [Space.COPPER]: Infinity,
  [Space.DESERT]: Infinity,
});
DISTANCE_MAP.set('1,1', {
  [Space.AMBER]: 4,
  [Space.BRONZE]: 6,
  [Space.COPPER]: 8,
  [Space.DESERT]: 10,
});
DISTANCE_MAP.set('2,1', {
  [Space.AMBER]: 3,
  [Space.BRONZE]: 5,
  [Space.COPPER]: 7,
  [Space.DESERT]: 9,
});
DISTANCE_MAP.set('3,1', {
  [Space.AMBER]: 2,
  [Space.BRONZE]: 4,
  [Space.COPPER]: 6,
  [Space.DESERT]: 8,
});
DISTANCE_MAP.set('4,1', {
  [Space.AMBER]: 3,
  [Space.BRONZE]: 3,
  [Space.COPPER]: 5,
  [Space.DESERT]: 7,
});
DISTANCE_MAP.set('5,1', {
  [Space.AMBER]: 4,
  [Space.BRONZE]: 2,
  [Space.COPPER]: 4,
  [Space.DESERT]: 6,
});
DISTANCE_MAP.set('6,1', {
  [Space.AMBER]: 5,
  [Space.BRONZE]: 3,
  [Space.COPPER]: 3,
  [Space.DESERT]: 5,
});
DISTANCE_MAP.set('7,1', {
  [Space.AMBER]: 6,
  [Space.BRONZE]: 4,
  [Space.COPPER]: 2,
  [Space.DESERT]: 4,
});
DISTANCE_MAP.set('8,1', {
  [Space.AMBER]: 7,
  [Space.BRONZE]: 5,
  [Space.COPPER]: 3,
  [Space.DESERT]: 3,
});
DISTANCE_MAP.set('9,1', {
  [Space.AMBER]: 8,
  [Space.BRONZE]: 6,
  [Space.COPPER]: 4,
  [Space.DESERT]: 2,
});
DISTANCE_MAP.set('10,1', {
  [Space.AMBER]: 9,
  [Space.BRONZE]: 7,
  [Space.COPPER]: 5,
  [Space.DESERT]: 3,
});
DISTANCE_MAP.set('11,1', {
  [Space.AMBER]: 10,
  [Space.BRONZE]: 8,
  [Space.COPPER]: 6,
  [Space.DESERT]: 4,
});
DISTANCE_MAP.set('3,2', {
  [Space.AMBER]: 4,
  [Space.BRONZE]: 5,
  [Space.COPPER]: 7,
  [Space.DESERT]: 9,
});
DISTANCE_MAP.set('5,2', {
  [Space.AMBER]: 5,
  [Space.BRONZE]: 4,
  [Space.COPPER]: 5,
  [Space.DESERT]: 7,
});
DISTANCE_MAP.set('7,2', {
  [Space.AMBER]: 7,
  [Space.BRONZE]: 5,
  [Space.COPPER]: 4,
  [Space.DESERT]: 5,
});
DISTANCE_MAP.set('9,2', {
  [Space.AMBER]: 9,
  [Space.BRONZE]: 7,
  [Space.COPPER]: 5,
  [Space.DESERT]: 4,
});
DISTANCE_MAP.set('3,3', {
  [Space.AMBER]: 0,
  [Space.BRONZE]: 6,
  [Space.COPPER]: 8,
  [Space.DESERT]: 10,
});
DISTANCE_MAP.set('5,3', {
  [Space.AMBER]: 6,
  [Space.BRONZE]: 0,
  [Space.COPPER]: 6,
  [Space.DESERT]: 8,
});
DISTANCE_MAP.set('7,3', {
  [Space.AMBER]: 8,
  [Space.BRONZE]: 6,
  [Space.COPPER]: 0,
  [Space.DESERT]: 6,
});
DISTANCE_MAP.set('9,3', {
  [Space.AMBER]: 10,
  [Space.BRONZE]: 8,
  [Space.COPPER]: 6,
  [Space.DESERT]: 0,
});

interface State {
  grid: Space[][];
  cost: number;
  steps: number;
  prev?: State;
}

const TEST_STATE: State = {
  grid: '#############\n#...B.......#\n###B#.#C#D###\n  #A#D#C#A#\n  #########'
    .split('\n')
    .map(line =>
      line.split('').map(c => (c === ' ' ? Space.EMPTY : (c as Space)))
    ),
  steps: 0,
  cost: 0,
};

const FINISH_STATE: State = {
  grid: '#############\n#...........#\n###A#B#C#D###\n  #A#B#C#D#\n  #########'
    .split('\n')
    .map(line =>
      line.split('').map(c => (c === ' ' ? Space.EMPTY : (c as Space)))
    ),
  steps: 0,
  cost: 0,
};

function stateToString(state: State): string {
  // return JSON.stringify(state.grid);
  return state.grid.map(row => row.join('')).join('\n');
}

interface Future {
  state: State;
  moveCost: number;
}

// if a creature is in front of a door, returns that creature
function creatureInFrontOfDoor(state: State): Creature | undefined {
  const doorXs = [3, 5, 7, 9];
  const doorY = 1;
  for (const doorX of doorXs) {
    const space = state.grid[doorY][doorX];
    if (isCreature(space)) {
      return space;
    }
  }
  return undefined;
}

function getAroundStates(
  state: State,
  x: number,
  y: number,
  creature: Creature
): Future[] {
  // shortcut: if a creature is in front of a door in this state and this isn't that creature, there are no futures
  const inFrontOfDoor = creatureInFrontOfDoor(state);
  if (inFrontOfDoor && inFrontOfDoor !== creature) {
    return [];
  }

  const futures: Future[] = [];
  const around = pointsAround(state.grid, x, y);
  for (const to of around) {
    if (to.data === Space.EMPTY) {
      if (y === 1 && to.y === 2) {
        // creatures only move into their own hole
        if (FINISH_STATE.grid[to.y][to.x] !== creature) {
          continue;
        }
      }
      // make tha move
      const grid = cloneDeep(state.grid);
      grid[y][x] = Space.EMPTY;
      grid[to.y][to.x] = creature;
      const future: Future = {
        state: {
          grid,
          prev: state,
          steps: state.steps + 1,
          cost: state.cost + MOVE_COST[creature],
        },
        moveCost: MOVE_COST[creature],
      };
      futures.push(future);
    }
  }
  return futures;
}

function isHome(state: State, x: number, y: number): boolean {
  const space = state.grid[y][x];
  if (!isCreature(space)) {
    return false;
  }
  if (y === 3) {
    // all we care is that it's in its correct column
    return space === FINISH_STATE.grid[y][x];
  } else if (y === 2) {
    // we care that it's in the right spot and the creature below us is in the right spot
    return (
      space === FINISH_STATE.grid[y][x] &&
      state.grid[3][x] === FINISH_STATE.grid[3][x]
    );
  }
  return false;
}

function getFutures(state: State): Future[] {
  const futures: Future[] = [];

  const creatures: Point<Creature>[] = [];

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
    const around = getAroundStates(
      state,
      creature.x,
      creature.y,
      creature.data
    );
    futures.push(...around);
  }

  console.log('  futures', futures.length);

  return futures;
}

function aStar(start: State, finish: State): number {
  function heuristicScore(state: State): number {
    // let score = 0;
    // for (let y = 0; y < state.grid.length; y++) {
    //   for (let x = 0; x < state.grid[y].length; x++) {
    //     const space = state.grid[y][x];
    //     if (isCreature(space)) {
    //       if (!isHome(state, x, y)) {
    //         score += DISTANCE_MAP.get(`${x},${y}`)[space] * MOVE_COST[space];
    //       }
    //     }
    //   }
    // }
    // return score;
    return 0;
  }

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  const fScore = new MapWithDefault<string, number>(Infinity);

  function compareStates(a: State, b: State): number {
    return fScore.get(stateToString(a)) - fScore.get(stateToString(b));
  }

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  const openSet = new SortedQueue<State>(compareStates, [start]);

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

  while (openSet.size > 0) {
    const curr = openSet.dequeueMin()!;

    console.log(
      'checking',
      'g',
      gScore.get(stateToString(curr)),
      'f',
      fScore.get(stateToString(curr)),
      'steps',
      curr.steps
    );
    console.log(stateToString(curr));

    if (stateToString(curr) === stateToString(finish)) {
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

        if (
          !openSet.includes(
            future.state,
            (a, b) => stateToString(a) === stateToString(b)
          )
        ) {
          // console.log('    enqueuein');
          openSet.enqueue(future.state);
        }
      }
    }
  }

  // woops
  return -1;
}

function dfs(start: State, finish: State): number {
  const visited = new Set<string>();
  const stack = [start];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (visited.has(stateToString(curr)) || curr.steps > 50) {
      continue;
    }
    visited.add(stateToString(curr));

    console.log(
      'checking',
      'steps',
      curr.steps,
      'cost',
      curr.cost,
      's',
      stack.length
    );
    console.log(stateToString(curr));

    if (stateToString(curr) === stateToString(finish)) {
      return 1;
    }

    const futures = getFutures(curr);

    stack.push(...futures.map(f => f.state));
  }

  return -1;
}

function bfs(start: State, finish: State): number {
  const visited = new Set<string>();
  const queue = [start];

  while (queue.length > 0) {
    const curr = queue.splice(0, 1)[0];
    if (visited.has(stateToString(curr)) || curr.steps > 50) {
      continue;
    }
    visited.add(stateToString(curr));

    console.log(
      'checking',
      'steps',
      curr.steps,
      'cost',
      curr.cost,
      'q',
      queue.length
    );
    console.log(stateToString(curr));

    if (stateToString(curr) === stateToString(finish)) {
      return 1;
    }

    const futures = getFutures(curr);

    queue.push(...futures.map(f => f.state));
  }

  return -1;
}

function part1(grid: Space[][]): number {
  const initialState: State = {
    grid,
    cost: 0,
    steps: 0,
  };

  const result = aStar(initialState, FINISH_STATE);

  return result;
}

function part2(grid: Space[][]): number {
  return 0;
}

const grid = fileAsGrid<Space>('src/day23/input.txt', c =>
  c === ' ' ? Space.EMPTY : (c as Space)
);
printSolution(part1(grid), part2(grid));
