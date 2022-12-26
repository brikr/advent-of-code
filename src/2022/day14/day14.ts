import {minBy} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {
  coordString,
  fromCoordString,
  Point,
  pointsAlongLine,
} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';

// true if sand landed, false if simulation ended. sand modified in place
function simulateSand(
  rocks: Set<string>,
  sand: Set<string>,
  drop: Point,
  highestY: number,
  treatHighestYAsRock = false
): boolean {
  // console.log('dropping from', drop, 'grains', sand.size, 'highestY', highestY);

  if (rocks.has(coordString(drop)) || sand.has(coordString(drop))) {
    // console.log('  no room!');
    return false;
  }

  let currentPoint = drop;
  let moved = true;
  while (currentPoint.y <= highestY && moved) {
    if (currentPoint.y + 1 === highestY && treatHighestYAsRock) {
      // found ground. settle here
      moved = false;
      continue;
    }

    const belowMid = {x: currentPoint.x, y: currentPoint.y + 1};
    const belowLeft = {x: currentPoint.x - 1, y: currentPoint.y + 1};
    const belowRight = {x: currentPoint.x + 1, y: currentPoint.y + 1};

    const nextPoint = [belowMid, belowLeft, belowRight].find(
      p => !rocks.has(coordString(p)) && !sand.has(coordString(p))
    );
    // console.log(
    //   '  candidates',
    //   belowMid,
    //   belowLeft,
    //   belowRight,
    //   'chosen',
    //   nextPoint
    // );
    if (nextPoint) {
      moved = true;
      currentPoint = nextPoint;
    } else {
      moved = false;
    }
  }

  if (currentPoint.y <= highestY) {
    // didn't fall into the nether. save its location
    sand.add(coordString(currentPoint));
    // console.log('  final location', currentPoint, 'grains', sand.size);
    return true;
  } else {
    // console.log('  fell into void!');
    return false;
  }
}

function part1(rocks: Set<string>, highestY: number): number {
  const sand = new Set<string>();
  while (simulateSand(rocks, sand, {x: 500, y: 0}, highestY));

  return sand.size;
}

function part2(rocks: Set<string>, highestY: number): number {
  const sand = new Set<string>();
  while (simulateSand(rocks, sand, {x: 500, y: 0}, highestY + 2, true));

  // console.log(sand);

  return sand.size;
}

const paths = fileMapSync('src/2022/day14/input.txt', line =>
  line.split(' -> ').map(fromCoordString)
);

const rocks = new Set<string>();
let highestY = 0;
for (const path of paths) {
  // console.log('path', path);
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    // console.log('from', from, 'to', to);
    for (const point of pointsAlongLine(from, to)) {
      // console.log(point);
      rocks.add(coordString(point));

      if (point.y > highestY) {
        highestY = point.y;
      }
    }
  }
}
// console.log(rocks);

printSolution(part1(rocks, highestY), part2(rocks, highestY));
