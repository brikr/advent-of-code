import {
  Direction,
  Point,
  pointsEqual,
  DIRECTION_DELTAS,
  addPoints,
  manhattanDistance,
  coordString,
  allAdjacentPoints,
} from './../../utils/grid';
import {fileAsGrid} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {cloneDeep, invert} from 'lodash';
import {wrap} from '../../utils/wrap';
import {AStarSolver} from '../../utils/aStar';

const ARROW_TO_DIR = {
  '^': 'up',
  v: 'down',
  '<': 'left',
  '>': 'right',
} as const;
const DIR_TO_ARROW = invert(ARROW_TO_DIR);

interface Blizzard {
  direction: Direction;
}

interface GridSquare {
  isWall: boolean;
  blizzards: Blizzard[];
}
type Grid = GridSquare[][];

function gridToString(grid: Grid, currentLocation?: Point): string {
  let rval = '';
  for (const [y, row] of grid.entries()) {
    let line = '';
    for (const [x, square] of row.entries()) {
      if (currentLocation && pointsEqual(currentLocation, {x, y})) {
        line += 'E';
      } else if (square.isWall) {
        line += '#';
      } else if (square.blizzards.length === 0) {
        line += '.';
      } else if (square.blizzards.length === 1) {
        line += DIR_TO_ARROW[square.blizzards[0].direction];
      } else {
        line += square.blizzards.length > 9 ? '!' : square.blizzards.length;
      }
    }
    rval += line + '\n';
  }
  return rval;
}

const BLIZZARDS_CACHE = new Map<number, Grid>();

function getBlizzardsForTime(minute: number): Grid {
  const cached = BLIZZARDS_CACHE.get(minute);
  if (cached) {
    return cached;
  }
  // find the highest key in the cache
  let latestCachedMinute = 0;
  let latestCachedGrid = BLIZZARDS_CACHE.get(0)!;
  for (const [cachedMinute, cachedGrid] of BLIZZARDS_CACHE.entries()) {
    if (cachedMinute > latestCachedMinute) {
      latestCachedMinute = cachedMinute;
      latestCachedGrid = cachedGrid;
    }
  }
  // simulate up to desired minute
  let currentMinute = latestCachedMinute;
  let currentGrid = latestCachedGrid;
  while (currentMinute <= minute) {
    currentMinute++;
    currentGrid = moveBlizzards(currentGrid);
    BLIZZARDS_CACHE.set(currentMinute, currentGrid);
  }
  return currentGrid;
}

// simulate all blizzards in the grid
// returns the result as a new object
function moveBlizzards(grid: Grid): Grid {
  const newGrid: Grid = grid.map(row =>
    row.map(square =>
      square.isWall
        ? {isWall: true, blizzards: []}
        : {isWall: false, blizzards: []}
    )
  );

  for (const [y, row] of grid.entries()) {
    for (const [x, square] of row.entries()) {
      for (const blizzard of square.blizzards) {
        const newLocation = addPoints(
          {x, y},
          DIRECTION_DELTAS[blizzard.direction]
        );
        // wrap the new location if necessary
        newLocation.x = wrap(1, newGrid[0].length - 2, newLocation.x);
        newLocation.y = wrap(1, newGrid.length - 2, newLocation.y);
        newGrid[newLocation.y][newLocation.x].blizzards.push(blizzard);
      }
    }
  }

  return newGrid;
}

interface State {
  currentLocation: Point;
  timePassed: number;
  beenThere: boolean;
  beenBack: boolean;
}

class BlizzardNavigator extends AStarSolver<State> {
  heuristicScore(state: State): number {
    if (!state.beenThere) {
      // distance to finish + back + there again
      manhattanDistance(state.currentLocation, FINISH_LOCATION) +
        2 * manhattanDistance(START_LOCATION, FINISH_LOCATION);
    } else if (state.beenThere && !state.beenBack) {
      // distance to start + back to finish
      manhattanDistance(state.currentLocation, START_LOCATION) +
        manhattanDistance(START_LOCATION, FINISH_LOCATION);
    }
    // distance to finish
    return manhattanDistance(state.currentLocation, FINISH_LOCATION);
  }

  stateToString(state: State): string {
    // TODO: might be a little slow, could optimize by writing something myself
    return (
      coordString(state.currentLocation) +
      ',' +
      state.timePassed +
      ',' +
      state.beenThere +
      ',' +
      state.beenBack
    );
  }

  isFinish(state: State): boolean {
    return (
      state.beenThere &&
      state.beenBack &&
      pointsEqual(state.currentLocation, FINISH_LOCATION)
    );
  }

  getFutures(state: State): State[] {
    // create a future for waiting, and a future for each direction
    const futures: State[] = [];

    // first, a future for waiting
    const waiting: State = {
      ...state,
      timePassed: state.timePassed + 1,
    };
    futures.push(waiting);

    // a future for moving in each direction
    const adjacent = allAdjacentPoints(state.currentLocation, false);
    for (const newLocation of adjacent) {
      const future: State = {
        ...state,
        currentLocation: newLocation,
        timePassed: state.timePassed + 1,
      };
      // god dam elf left his snacks
      if (
        !future.beenThere &&
        pointsEqual(future.currentLocation, FINISH_LOCATION)
      ) {
        future.beenThere = true;
      }
      if (
        future.beenThere &&
        !future.beenBack &&
        pointsEqual(future.currentLocation, START_LOCATION)
      ) {
        future.beenBack = true;
      }
      futures.push(future);
    }

    const blizzardsForNextMinute = getBlizzardsForTime(state.timePassed + 1);

    // if any futures end up with us on out of bounds, on a wall, or on a blizzard, remove them from the list
    return futures.filter(f => {
      const locationOnGrid =
        blizzardsForNextMinute[f.currentLocation.y]?.[f.currentLocation.x];
      return (
        locationOnGrid &&
        !locationOnGrid.isWall &&
        locationOnGrid.blizzards.length === 0
      );
    });
  }

  traverseCost(from: State, to: State): number {
    return 1;
  }
}

function part1(grid: Grid): number {
  const initialState: State = {
    currentLocation: {
      x: 1,
      y: 0,
    },
    timePassed: 0,
    beenThere: true,
    beenBack: true,
  };
  const solver = new BlizzardNavigator(initialState);

  solver.solve();

  return solver.finalState!.timePassed;
}

function part2(grid: Grid): number {
  const initialState: State = {
    currentLocation: {
      x: 1,
      y: 0,
    },
    timePassed: 0,
    beenThere: false,
    beenBack: false,
  };
  const solver = new BlizzardNavigator(initialState);

  // solver.debug = true;
  // solver.debugStateReportMod = 10000;

  solver.solve();

  return solver.finalState!.timePassed;
}

const grid = fileAsGrid<GridSquare>('src/2022/day24/input.txt', char => {
  if (char === '#') {
    return {
      isWall: true,
      blizzards: [],
    };
  } else if (char === '.') {
    return {
      isWall: false,
      blizzards: [],
    };
  } else {
    return {
      isWall: false,
      blizzards: [{direction: ARROW_TO_DIR[char as keyof typeof ARROW_TO_DIR]}],
    };
  }
});
BLIZZARDS_CACHE.set(0, grid);
const START_LOCATION: Point = {
  x: 1,
  y: 0,
};
const FINISH_LOCATION: Point = {
  x: grid[0].length - 2,
  y: grid.length - 1,
};
printSolution(part1(cloneDeep(grid)), part2(cloneDeep(grid)));
