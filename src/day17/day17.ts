import {inRange, last} from 'lodash';
import {fileLines} from '../utils/file';
import {MapWithDefault} from '../utils/mapWithDefault';
import {printSolution} from '../utils/printSolution';

interface Range {
  min: number;
  max: number;
}

interface TargetArea {
  x: Range;
  y: Range;
}

function xAfterNSteps(
  vx: number,
  steps: number,
  initialX = 0,
  drag = 1
): number {
  if (vx < 0) {
    // solve this later if we need to
    throw 'wtf';
  }
  // range of vx starts at vx and ends at vx - (steps * drag), but doesn't go past zero
  const n = vx;
  const m = Math.max(vx - (steps - drag), 0);

  // final x value is the sum of numbers from m to n, plus wherever x started
  return Math.floor(((n - m + 1) * (m + n)) / 2) + initialX;
}

function yAfterNSteps(
  vy: number,
  steps: number,
  initialY = 0,
  gravity = 1
): number {
  const n = vy;
  const m = vy - (steps - gravity);

  return Math.floor(((n - m + 1) * (m + n)) / 2) + initialY;
}

// returns a range of time values that hit the target area
function yHitRange(vy: number, {min, max}: Range): number[] {
  // console.log('willYEverHit', vy, min, max);
  let steps = 0;
  let hasBeenBeforeRange = false;
  let hasBeenAfterRange = false;
  const hits: number[] = [];
  while (!(hasBeenBeforeRange && hasBeenAfterRange)) {
    const y = yAfterNSteps(vy, steps);

    if (inRange(y, min, max + 1)) {
      // cool
      hits.push(steps);
    } else if (y < min) {
      hasBeenBeforeRange = true;
    } else if (y > max) {
      hasBeenAfterRange = true;
    }

    steps++;
  }

  // saw both sides of the range, no new values to check
  return hits;
}

function xHitRange(vx: number, {min, max}: Range): number[] {
  // console.log('willXEverHit', vx, min, max);
  let lastX: number | undefined = 0;
  let x: number | undefined = undefined;
  let steps = 0;
  let hasBeenBeforeRange = false;
  let hasBeenAfterRange = false;
  const hits: number[] = [];
  while (!(hasBeenBeforeRange && hasBeenAfterRange) && x !== lastX) {
    lastX = x;
    x = xAfterNSteps(vx, steps);
    // console.log('  ', lastX, x);

    if (inRange(x, min, max + 1)) {
      // cool
      hits.push(steps);
    } else if (x < min) {
      hasBeenBeforeRange = true;
    } else if (x > max) {
      hasBeenAfterRange = true;
    }

    steps++;
  }

  // if x *ended* inside the range, note that by adding Infinity to the range
  if (inRange(x!, min, max + 1)) {
    hits.push(Infinity);
  }

  // saw both sides of the range or stopped moving, no new values to check
  return hits;
}

// just assuming answers won't be in this range for now
const MIN_VX0 = 0;
const MIN_VY0 = -1000;
const MAX_V0 = 1000;

function part1(input: TargetArea): number {
  // console.log(input);

  // assuming that if a given vy0 could land us within input's y range, there is also a vx0 that could land us there
  // so for part 1, just worrying about y

  // jus find all vy0's that work
  const possibleVy0s = [];
  let vy0 = MIN_VY0;
  while (vy0 < MAX_V0) {
    if (yHitRange(vy0, input.y).length > 0) {
      possibleVy0s.push(vy0);
    }

    vy0++;
  }

  if (possibleVy0s.length === 0) {
    throw 'wtf';
  }

  // console.log(possibleVy0s.join(','));

  // assuming the greatest vy0 that worked will produce the maximum y value in its curve
  // simulate it and note the peak
  const highestVy0 = last(possibleVy0s)!;
  let peak = 0;
  let steps = 0;
  let hit = false;
  while (!hit) {
    const y = yAfterNSteps(highestVy0, steps);

    if (inRange(y, input.y.min, input.y.max + 1)) {
      hit = true;
    }

    if (y > peak) {
      peak = y;
    }

    steps++;
  }

  return peak;
}

interface PossibleV0 {
  v0: number;
  // time ranges where it crosses target area
  range: number[];
}

function part2(input: TargetArea): number {
  // console.log(input);

  // jus find all vy0's that work
  const possibleVy0s: PossibleV0[] = [];
  let vy0 = MIN_VY0;
  while (vy0 < MAX_V0) {
    const range = yHitRange(vy0, input.y);
    if (range.length > 0) {
      possibleVy0s.push({v0: vy0, range});
    }

    vy0++;
  }

  if (possibleVy0s.length === 0) {
    throw 'wtfy';
  }

  // then all the vx0s
  const possibleVx0s: PossibleV0[] = [];
  let vx0 = MIN_VX0;
  while (vx0 < MAX_V0) {
    const range = xHitRange(vx0, input.x);
    if (range.length > 0) {
      possibleVx0s.push({v0: vx0, range});
    }

    vx0++;
  }

  if (possibleVx0s.length === 0) {
    throw 'wtfx';
  }

  // console.log('x', JSON.stringify(possibleVx0s, null, 2));
  // console.log('y', JSON.stringify(possibleVy0s, null, 2));

  // key: time value, value: number of vx0s that cross the area at that time
  const xCountAtEachTime = new MapWithDefault<number, number>(0);
  // vy0s that cross
  const yCountAtEachTime = new MapWithDefault<number, number>(0);
  // vx0s that stay in box forever
  const xInfinityStartTimes: number[] = [];

  let maxTime = 0;
  for (const possible of possibleVx0s) {
    if (last(possible.range) === Infinity) {
      // this is an infinite range, just note where it starts
      xInfinityStartTimes.push(possible.range[0]);
    } else {
      // non-infinite range
      for (const time of possible.range) {
        maxTime = Math.max(time, maxTime);
        xCountAtEachTime.set(time, xCountAtEachTime.get(time) + 1);
      }
    }
  }

  for (const possible of possibleVy0s) {
    for (const time of possible.range) {
      maxTime = Math.max(time, maxTime);
      yCountAtEachTime.set(time, yCountAtEachTime.get(time) + 1);
    }
  }

  // console.log('x', xCountAtEachTime);
  // console.log('y', yCountAtEachTime);

  let total = 0;
  for (const possibleX of possibleVx0s) {
    for (const possibleY of possibleVy0s) {
      const xRange = possibleX.range;
      const yRange = possibleY.range;
      const xIsInfinite = last(xRange) === Infinity;
      if (
        xRange.find(t => yRange.includes(t)) ||
        (xIsInfinite && yRange.find(t => t > xRange[0]))
      ) {
        // console.log(possibleX.v0, possibleY.v0);
        total++;
      }
    }
  }

  return total;
}

const lines = fileLines('src/day17/input.txt');

const match = lines[0].match(/x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/);
const [_, minX, maxX, minY, maxY] = match!.map(Number);
const input: TargetArea = {
  x: {
    min: minX,
    max: maxX,
  },
  y: {
    min: minY,
    max: maxY,
  },
};

printSolution(part1(input), part2(input));
