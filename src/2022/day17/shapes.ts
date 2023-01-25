import {Point} from '../../utils/grid';
import {PointSet} from '../../utils/pointSet';

export interface BakedShape {
  top: number;
  bottom: number;
  left: number;
  right: number;

  leftCollisions: PointSet;
  rightCollisions: PointSet;
  downCollisions: PointSet;

  allPoints: PointSet;
}

export function right(point: Point): Point {
  return {x: point.x + 1, y: point.y};
}

export function left(point: Point): Point {
  return {x: point.x - 1, y: point.y};
}

export function down(point: Point): Point {
  return {x: point.x, y: point.y - 1};
}

export function bakeShape(ps: PointSet): BakedShape {
  const baked: BakedShape = {
    top: Number.MIN_SAFE_INTEGER,
    bottom: Number.MAX_SAFE_INTEGER,
    left: Number.MAX_SAFE_INTEGER,
    right: Number.MIN_SAFE_INTEGER,

    leftCollisions: new PointSet(),
    rightCollisions: new PointSet(),
    downCollisions: new PointSet(),

    allPoints: ps,
  };

  ps.forEach(point => {
    // Update bounds
    if (point.y > baked.top) {
      baked.top = point.y;
    }
    if (point.y < baked.bottom) {
      baked.bottom = point.y;
    }
    if (point.x > baked.right) {
      baked.right = point.x;
    }
    if (point.x < baked.left) {
      baked.left = point.x;
    }

    // Check points around and see if this should be in a collision set
    // left
    if (!ps.has(left(point))) {
      baked.leftCollisions.add(point);
    }
    // right
    if (!ps.has(right(point))) {
      baked.rightCollisions.add(point);
    }
    // bottom
    if (!ps.has(down(point))) {
      baked.downCollisions.add(point);
    }
  });

  return baked;
}

/*
  ####
*/
export const WIDE_MF = bakeShape(
  new PointSet([
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 2, y: 0},
    {x: 3, y: 0},
  ])
);

/*
  .#.
  ###
  .#.
*/
export const PLUS_MF = bakeShape(
  new PointSet([
    {x: 1, y: 0},
    {x: 0, y: 1},
    {x: 1, y: 1},
    {x: 2, y: 1},
    {x: 1, y: 2},
  ])
);

/*
  ..#
  ..#
  ###
*/
export const REVERSE_L_MF = bakeShape(
  new PointSet([
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 2, y: 0},
    {x: 2, y: 1},
    {x: 2, y: 2},
  ])
);

/*
  #
  #
  #
  #
*/
export const TALL_MF = bakeShape(
  new PointSet([
    {x: 0, y: 0},
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 0, y: 3},
  ])
);

/*
  ##
  ##
*/
export const SQUARE_MF = bakeShape(
  new PointSet([
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 0, y: 1},
    {x: 1, y: 1},
  ])
);

export const DROP_ORDER = [WIDE_MF, PLUS_MF, REVERSE_L_MF, TALL_MF, SQUARE_MF];
