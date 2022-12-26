import {fileAsGrid} from '../../utils/file';
import {
  coordString,
  PointWithData,
  pointsAround,
  pointsEqual,
} from '../../utils/grid';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';
import {SortedQueue} from '../../utils/sortedQueue';

interface State {
  currentLocation: PointWithData<string>;
  visited: Set<string>;
  pathLength: number;
}

function findStartAndEnd(
  grid: string[][]
): [PointWithData<string>, PointWithData<string>] {
  let start: PointWithData<string> | undefined;
  let end: PointWithData<string> | undefined;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'S') {
        start = {
          x,
          y,
          data: 'S',
        };
      } else if (grid[y][x] === 'E') {
        end = {
          x,
          y,
          data: 'E',
        };
      }
      if (start && end) {
        return [start, end];
      }
    }
  }
  throw 'could not find start and end!';
}

function getAltitude(data: string): string {
  if (data === 'S') {
    return 'a';
  } else if (data === 'E') {
    return 'z';
  } else {
    return data;
  }
}

function canTraverse(from: string, to: string): boolean {
  const fromAlt = getAltitude(from).charCodeAt(0);
  const toAlt = getAltitude(to).charCodeAt(0);

  // console.log(
  //   'canTraverse',
  //   from,
  //   to,
  //   fromAlt >= toAlt || fromAlt + 1 === toAlt
  // );

  return fromAlt >= toAlt || fromAlt + 1 === toAlt;
}

function getFutures(grid: string[][], state: State): State[] {
  const futures: State[] = [];
  for (const point of pointsAround(
    grid,
    state.currentLocation.x,
    state.currentLocation.y
  )) {
    if (
      !state.visited.has(coordString(point)) &&
      canTraverse(state.currentLocation.data, point.data)
    ) {
      const newVisited = new Set<string>(state.visited);
      newVisited.add(coordString(point));
      futures.push({
        currentLocation: point,
        visited: newVisited,
        pathLength: state.pathLength + 1,
      });
    }
  }
  // console.log('futures', futures);
  return futures;
}

function aStar(
  grid: string[][],
  start: PointWithData<string>,
  finish: PointWithData<string>
): number {
  function heuristicScore(point: PointWithData<string>): number {
    // heuristic is manhattan distance from finish
    // further from start = closer to finish
    return finish.x - point.x + (finish.y - point.y);
  }

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  const fScore = new MapWithDefault<string, number>(Infinity);

  function comparePoints(
    a: PointWithData<string>,
    b: PointWithData<string>
  ): number {
    return fScore.get(coordString(a)) - fScore.get(coordString(b));
  }

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  const openSet = new SortedQueue<PointWithData<string>>(comparePoints, [
    start,
  ]);

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  // might not actually need this
  // key: point, value: point
  const cameFrom = new Map<string, string>();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  // key: point, value: cheapest path
  const gScore = new MapWithDefault<string, number>(Infinity);
  gScore.set(coordString(start), 0);

  fScore.set(coordString(start), heuristicScore(start));

  while (openSet.size > 0) {
    const curr = openSet.dequeueMin()!;

    if (pointsEqual(curr, finish)) {
      // we did it
      return gScore.get(coordString(curr));
    }

    const around = pointsAround(grid, curr.x, curr.y);
    for (const neighbor of around) {
      if (!canTraverse(curr.data, neighbor.data)) {
        continue;
      }
      // tentative_gScore is the distance from start to the neighbor through current
      const tentativeGScore = gScore.get(coordString(curr)) + 1;

      if (tentativeGScore < gScore.get(coordString(neighbor))) {
        // This path to neighbor is better than any previous one. Record it!
        cameFrom.set(coordString(neighbor), coordString(curr));
        gScore.set(coordString(neighbor), tentativeGScore);
        fScore.set(
          coordString(neighbor),
          tentativeGScore + heuristicScore(neighbor)
        );

        if (!openSet.includes(neighbor, pointsEqual)) {
          openSet.enqueue(neighbor);
        }
      }
    }
  }

  // woops
  return -1;
}

function part1(grid: string[][]): number {
  const [start, finish] = findStartAndEnd(grid);

  return aStar(grid, start, finish);
}

function part2(grid: string[][]): number {
  const [_, finish] = findStartAndEnd(grid);
  const initialPoints: PointWithData<string>[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'a') {
        initialPoints.push({x, y, data: 'a'});
      }
    }
  }

  let min = Number.MAX_SAFE_INTEGER;

  for (const start of initialPoints) {
    const length = aStar(grid, start, finish);
    if (length !== -1 && length < min) {
      // console.log('new min', min);
      min = length;
    }
  }

  return min;
}

const grid = fileAsGrid('src/2022/day12/input.txt');
printSolution(part1(grid), part2(grid));
