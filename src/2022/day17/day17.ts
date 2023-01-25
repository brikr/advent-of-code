import {repeat} from 'lodash';
import {DROP_ORDER, BakedShape, left, right, down} from './shapes';
import {fileMapSync} from '../../utils/file';
import {PointSet} from '../../utils/pointSet';
import {printSolution} from '../../utils/printSolution';
import {addPoints, Point, subtractPoints} from '../../utils/grid';
import _ = require('lodash');
import {lcm} from '../../utils/math';

interface ChamberState {
  settledRocks: PointSet;
  numSettledRocks: number;
  highestSettled: number[];

  fallingShape: BakedShape;
  fallingShapeOrigin: Point;
}

type Direction = 'left' | 'right' | 'down';
const CHAMBER_WIDTH = 7;

function chamberToString(chamber: ChamberState): string {
  let rval = '';

  const highestY = Math.max(
    ...chamber.highestSettled,
    chamber.fallingShapeOrigin.y + chamber.fallingShape.top
  );

  let y = highestY;
  while (y >= 0) {
    let line = '|';
    for (let x = 0; x < CHAMBER_WIDTH; x++) {
      if (chamber.settledRocks.has({x, y})) {
        line += '#';
      } else if (
        chamber.fallingShape.allPoints.has(
          subtractPoints({x, y}, chamber.fallingShapeOrigin)
        )
      ) {
        line += '@';
      } else {
        line += '.';
      }
    }
    line += '|';
    rval += line + '\n';

    y--;
  }

  rval += repeat('-', CHAMBER_WIDTH + 2);

  return rval;
}

function chamberTop(chamber: ChamberState): number[] {
  const rval = [0];
  for (let i = 1; i < chamber.highestSettled.length; i++) {
    rval.push(chamber.highestSettled[i] - chamber.highestSettled[0]);
  }
  const min = Math.abs(Math.min(...rval));
  return rval.map(v => v + min);
}

// returns true if the shape moves, false if it doesn't collision
const DIRECTION_TO_FN = {
  left,
  right,
  down,
} as const;

function moveFallingShape(
  chamber: ChamberState,
  direction: Direction
): boolean {
  // check for collisions in the direction we are moving
  const directionFn = DIRECTION_TO_FN[direction];
  const collisionPoints = chamber.fallingShape[`${direction}Collisions`];

  let collision = false;
  // TODO: this might be slow if shapes are big; being able to short circuit w/ normal iterator would be better
  collisionPoints.forEach(relativePoint => {
    const absolutePoint = addPoints(relativePoint, chamber.fallingShapeOrigin);
    const collisionCheckPoint = directionFn(absolutePoint);
    if (
      chamber.settledRocks.has(collisionCheckPoint) ||
      collisionCheckPoint.x < 0 ||
      collisionCheckPoint.x >= CHAMBER_WIDTH ||
      collisionCheckPoint.y < 0
    ) {
      collision = true;
    }
  });

  if (collision) {
    // collision; shape did not move
    return false;
  }

  // no collision, move tha shape
  chamber.fallingShapeOrigin = directionFn(chamber.fallingShapeOrigin);

  return true;
}

function allDefined(...values: Array<number | undefined>): boolean {
  return values.every(v => v !== undefined);
}

function simulate(directions: Direction[], maxFallenCount: number): number {
  let dropIdx = 0;
  let directionIdx = 0;
  const stepLength = directions.length * DROP_ORDER.length;
  let actionStepBase: number | undefined = undefined;
  let actionStepDelta: number | undefined = undefined;
  let settledStepBase: number | undefined = undefined;
  let settledStepDelta: number | undefined = undefined;
  let actionCount = 0;
  const stepHeights: number[] = [];
  const chamber: ChamberState = {
    settledRocks: new PointSet(),
    numSettledRocks: 0,
    highestSettled: new Array(CHAMBER_WIDTH).fill(0),

    fallingShape: DROP_ORDER[dropIdx],
    fallingShapeOrigin: {x: 2, y: 3},
  };
  while (
    chamber.numSettledRocks < maxFallenCount &&
    !allDefined(
      actionStepBase,
      actionStepDelta,
      settledStepBase,
      settledStepDelta
    )
  ) {
    moveFallingShape(chamber, directions[directionIdx]);
    // console.log('moved shape', directions[directionIdx]);
    // console.log(chamberToString(chamber));

    const fell = moveFallingShape(chamber, 'down');

    if (!fell) {
      // shape has settled
      chamber.numSettledRocks++;

      // add all of shapes points to settled rocks
      chamber.fallingShape.allPoints.forEach(relativePoint => {
        const absolutePoint = addPoints(
          relativePoint,
          chamber.fallingShapeOrigin
        );
        chamber.settledRocks.add(absolutePoint);
        // updated highest settled
        if (absolutePoint.y > chamber.highestSettled[absolutePoint.x]) {
          chamber.highestSettled[absolutePoint.x] = absolutePoint.y;
        }
      });

      // go to the next shape for falling
      dropIdx = (dropIdx + 1) % DROP_ORDER.length;
      chamber.fallingShape = DROP_ORDER[dropIdx];
      chamber.fallingShapeOrigin = {
        x: 2,
        y: Math.max(...chamber.highestSettled) + 4,
      };

      // update stepHeights
      if (
        actionStepBase !== undefined &&
        settledStepBase !== undefined &&
        settledStepDelta === undefined
      ) {
        stepHeights.push(Math.max(...chamber.highestSettled) - actionStepBase);
      }

      // if (chamber.numSettledRocks % 1000 === 0) {
      //   console.log(
      //     'shape settled!',
      //     chamber.numSettledRocks,
      //     'highest',
      //     chamber.highestSettled
      //   );
      // }
    }
    // console.log('moved shape down');
    // console.log(chamberToString(chamber));

    directionIdx = (directionIdx + 1) % directions.length;

    actionCount++;
    if (actionCount % stepLength === 0) {
      if (actionStepBase === undefined) {
        actionStepBase = Math.max(...chamber.highestSettled);
      } else if (actionStepDelta === undefined) {
        actionStepDelta = Math.max(...chamber.highestSettled) - actionStepBase;
      }
      if (settledStepBase === undefined) {
        settledStepBase = chamber.numSettledRocks;
      } else if (settledStepDelta === undefined) {
        settledStepDelta = chamber.numSettledRocks - settledStepBase;
      }
      // console.log(
      //   'after',
      //   actionCount,
      //   'actions; least common: ',
      //   stepLength,
      //   'highest settled',
      //   Math.max(...chamber.highestSettled)
      // );
      // console.log('chamberTop', chamberTop(chamber));
      // console.log('numSettled', chamber.numSettledRocks);
    }
  }
  if (
    allDefined(
      actionStepBase,
      actionStepDelta,
      settledStepBase,
      settledStepDelta
    )
  ) {
    // console.log(
    //   'step length',
    //   stepLength,
    //   'action step base',
    //   actionStepBase,
    //   'action step delta',
    //   actionStepDelta,
    //   'settled step base',
    //   settledStepBase,
    //   'settled step delta',
    //   settledStepDelta,
    //   'chamberTop',
    //   chamberTop(chamber)
    // );

    // figure out how far we can fast-forward
    const wholeStepCount = Math.floor(
      (maxFallenCount - settledStepBase!) / settledStepDelta!
    );
    const settledRemainder =
      (maxFallenCount - settledStepBase!) % settledStepDelta!;
    // console.log(
    //   'need to skip',
    //   wholeStepCount,
    //   'whole steps (not including base) and then settle',
    //   settledRemainder,
    //   'more rocks'
    // );
    // console.log('stepHeights', stepHeights);

    return (
      actionStepBase! +
      wholeStepCount * actionStepDelta! +
      stepHeights[settledRemainder - 1] +
      1
    );
  }
  return Math.max(...chamber.highestSettled) + 1;
}

function part1(directions: Direction[]): number {
  return simulate(directions, 2022);
}

function part2(directions: Direction[]): number {
  return simulate(directions, 1000000000000);
}

const directions = fileMapSync('src/2022/day17/input.txt', line =>
  line.split('').map(char => (char === '>' ? 'right' : 'left'))
)[0];
printSolution(part1(directions), part2(directions));
