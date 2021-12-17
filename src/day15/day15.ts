import {minBy, times} from 'lodash';
import {transpose} from '../utils/array';
import {fileAsGrid} from '../utils/file';
import {Point, pointsAround, coordString, pointsEqual} from '../utils/grid';
import {MapWithDefault} from '../utils/mapWithDefault';
import {printSolution} from '../utils/printSolution';
import {SortedQueue} from '../utils/sortedQueue';

function dijkstra(input: number[][]): number {
  const inputSize = input.length * input[0].length;

  // key: point as "x,y" string
  const shortestPath = new Map<string, number>();
  const distance = new MapWithDefault<string, number>(Infinity);

  // distance to starting square is zero
  distance.set('0,0', 0);

  while (shortestPath.size < inputSize) {
    // pick point with min distance value
    const [minCoords, minDistance] = minBy(
      [...distance],
      ([coords, distance]) => (shortestPath.has(coords) ? Infinity : distance)
    )!;

    // console.log(minCoords, minDistance);

    // include its distance in shortestPath
    shortestPath.set(minCoords, minDistance);

    // update distance values of adjacent points
    const [minX, minY] = minCoords.split(',').map(Number);
    const around = pointsAround(input, minX, minY);
    for (const point of around) {
      // console.log('  ', point);
      // new point's distance value is minDistance point's distance + new point's weight
      const newDistance = minDistance + point.data;
      const existingDistance = distance.get(`${point.x},${point.y}`);
      if (existingDistance === undefined || newDistance < existingDistance) {
        distance.set(`${point.x},${point.y}`, newDistance);
      }
    }
  }

  // console.log(distance, shortestPath);

  return shortestPath.get(`${input.length - 1},${input[0].length - 1}`)!;
}

function aStar(input: number[][]): number {
  const start = {x: 0, y: 0, data: 0};
  const finish = {
    x: input[0].length - 1,
    y: input.length - 1,
    data: input[input.length - 1][input[0].length - 1],
  };
  function heuristicScore(point: Point<number>): number {
    // heuristic is manhattan distance from finish
    // further from start = closer to finish
    return finish.x - point.x + (finish.y - point.y);
  }

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  const fScore = new MapWithDefault<string, number>(Infinity);

  function comparePoints(a: Point<number>, b: Point<number>): number {
    return fScore.get(coordString(a)) - fScore.get(coordString(b));
  }

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  const openSet = new SortedQueue<Point<number>>(comparePoints, [start]);

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

    // console.log(
    //   'checking',
    //   curr,
    //   'g',
    //   gScore.get(coordString(curr)),
    //   'f',
    //   fScore.get(coordString(curr))
    // );

    if (pointsEqual(curr, finish)) {
      // we did it
      // console.log(gScore);
      // console.log(cameFrom);
      return gScore.get(coordString(curr));
    }

    const around = pointsAround(input, curr.x, curr.y);
    for (const neighbor of around) {
      // tentative_gScore is the distance from start to the neighbor through current
      const tentativeGScore = gScore.get(coordString(curr)) + neighbor.data;
      // console.log(
      //   '  checking neighbor',
      //   neighbor,
      //   'g',
      //   gScore.get(coordString(neighbor)),
      //   'tentative',
      //   tentativeGScore
      // );

      if (tentativeGScore < gScore.get(coordString(neighbor))) {
        // This path to neighbor is better than any previous one. Record it!
        // console.log(
        //   '    recordin',
        //   'g',
        //   tentativeGScore,
        //   'f',
        //   tentativeGScore + heuristicScore(neighbor)
        // );
        cameFrom.set(coordString(neighbor), coordString(curr));
        gScore.set(coordString(neighbor), tentativeGScore);
        fScore.set(
          coordString(neighbor),
          tentativeGScore + heuristicScore(neighbor)
        );

        if (!openSet.includes(neighbor, pointsEqual)) {
          // console.log('    enqueuein');
          openSet.enqueue(neighbor);
        }
      }
    }
  }

  // woops
  return -1;
}

function part1(input: number[][]): number {
  return aStar(input);
}

function growRowAndAdd(row: number[]): number[] {
  const newRow: number[] = [];
  times(5, idx => {
    newRow.push(
      ...row.map(point => {
        const newVal = (point + idx) % 9;
        // wrap to 1 after 9, so 9s are ok, zeroes are not
        return newVal === 0 ? 9 : newVal;
      })
    );
  });
  return newRow;
}

function part2(input: number[][]): number {
  let newInput = input.map(growRowAndAdd);
  newInput = transpose(newInput).map(growRowAndAdd);

  // console.log(newInput);

  return aStar(newInput);
  // return 0;
}

const input = fileAsGrid('src/day15/input.txt', Number);
printSolution(part1(input), part2(input));
