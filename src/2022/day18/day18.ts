import {cloneDeep} from 'lodash';
import {
  Area3D,
  Point3D,
  pointFromString,
  pointInArea,
  pointsAround,
  pointToString,
} from '../../utils/3DSpace';
import {fileMapSync} from '../../utils/file';
import {HashMap} from '../../utils/hashMap';
import {HashSet} from '../../utils/hashSet';
import {printSolution} from '../../utils/printSolution';

function part1(points: Point3D[]): number {
  const hashSet = new HashSet<Point3D>(pointToString, points);

  let total = 0;
  for (const p of points) {
    const around = pointsAround(p, false);
    for (const neighbor of around) {
      // console.log('checking', p, 'to', neighbor);
      if (!hashSet.has(neighbor)) {
        // console.log('  outside edge!');
        total++;
      }
    }
  }

  return total;
}

// dfs fill algorithm
// if we break the boundary, it's exterior
// if we run out of places to check, it's interior
function isPointInterior(
  point: Point3D,
  allPoints: HashSet<Point3D>,
  bounds: Area3D,
  interiorStatusCache: HashMap<Point3D, boolean>
): boolean {
  const cacheResult = interiorStatusCache.get(point);
  if (cacheResult !== undefined) {
    return cacheResult;
  }

  // console.log('pointsInterior', point);
  const visited = new HashSet<Point3D>(pointToString, [point]);
  const stack = [point];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    // console.log('  checking', curr.location);
    visited.add(curr);

    if (!pointInArea(curr, bounds)) {
      // left boundary: exterior
      // mark all visited points as exterior as well
      visited.forEach(p => interiorStatusCache.set(p, false));
      return false;
    }

    for (const neighbor of pointsAround(curr, false)) {
      if (visited.has(neighbor) || allPoints.has(neighbor)) {
        // don't traverse into solid space or visited space
        continue;
      }
      stack.push(neighbor);
    }
  }

  // ran out of states: interior
  // mark all visited points as interior as well
  visited.forEach(p => interiorStatusCache.set(p, true));
  return true;
}

function part2(points: Point3D[]): number {
  const allPoints = new HashSet<Point3D>(pointToString, points);
  const bounds: Area3D = {
    x: {
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER,
    },
    y: {
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER,
    },
    z: {
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER,
    },
  };

  // build total shape cuboid
  for (const p of points) {
    bounds.x.min = Math.min(bounds.x.min, p.x);
    bounds.x.max = Math.max(bounds.x.max, p.x);
    bounds.y.min = Math.min(bounds.y.min, p.y);
    bounds.y.max = Math.max(bounds.y.max, p.y);
    bounds.z.min = Math.min(bounds.z.min, p.z);
    bounds.z.max = Math.max(bounds.z.max, p.z);
  }

  // console.log('bounds', bounds);

  // find the real edges
  const interiorStatusCache = new HashMap<Point3D, boolean>(pointToString);
  let total = 0;
  for (const p of points) {
    // console.log('checking edges of', p);
    const around = pointsAround(p, false);
    for (const neighbor of around) {
      if (
        !allPoints.has(neighbor) &&
        !isPointInterior(neighbor, allPoints, bounds, interiorStatusCache)
      ) {
        total++;
      }
    }
  }

  return total;
}

const points = fileMapSync('src/2022/day18/input.txt', pointFromString);
printSolution(part1(points), part2(points));
