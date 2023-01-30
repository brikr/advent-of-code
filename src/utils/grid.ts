import {cloneDeep, times} from 'lodash';

export interface Point {
  x: number;
  y: number;
}

export interface PointWithData<T = never> extends Point {
  data: T;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
export const CLOCKWISE: Direction[] = ['up', 'right', 'down', 'left'];
export const COUNTERCLOCKWISE: Direction[] = ['up', 'left', 'down', 'right'];
export const OPPOSITE_DIRECTION = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
} as const;
export const DIRECTION_DELTAS = {
  up: {
    x: 0,
    y: -1,
  },
  down: {
    x: 0,
    y: 1,
  },
  left: {
    x: -1,
    y: 0,
  },
  right: {x: 1, y: 0},
} as const;

export function pointsAround<T>(
  map: T[][],
  x: number,
  y: number,
  directions: Direction[] = ['up', 'down', 'left', 'right']
): PointWithData<T>[] {
  const around: PointWithData<T>[] = [];
  if (directions.includes('up')) {
    const up = map[y - 1]?.[x];
    around.push({
      x,
      y: y - 1,
      data: up,
    });
  }
  if (directions.includes('down')) {
    const down = map[y + 1]?.[x];
    around.push({
      x,
      y: y + 1,
      data: down,
    });
  }
  if (directions.includes('left')) {
    const left = map[y][x - 1];
    around.push({
      x: x - 1,
      y,
      data: left,
    });
  }
  if (directions.includes('right')) {
    const right = map[y][x + 1];
    around.push({
      x: x + 1,
      y,
      data: right,
    });
  }
  return around.filter(p => p.data !== undefined);
}

export function isEdge(arr: unknown[][], x: number, y: number): boolean {
  return x === 0 || y === 0 || x === arr[0].length - 1 || y === arr.length - 1;
}

export function gridMin<T>(arr: T[][]): PointWithData<T> {
  let minY = 0;
  let minX = 0;
  let minVal = arr[minY][minX];
  for (let y = 0; y < arr.length; y++) {
    for (let x = 0; x < arr[y].length; x++) {
      if (arr[y][x] < minVal) {
        minX = x;
        minY = y;
        minVal = arr[y][x];
      }
    }
  }
  return {
    x: minX,
    y: minY,
    data: minVal,
  };
}

export function gridForEach<T>(
  arr: T[][],
  fn: (x: number, y: number, data: T) => unknown
) {
  for (let y = 0; y < arr.length; y++) {
    for (let x = 0; x < arr[y].length; x++) {
      fn(x, y, arr[y][x]);
    }
  }
}

export function pointsAdjacent(
  a: Point,
  b: Point,
  countDiagonals = false
): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx !== 0 && dy !== 0 && !countDiagonals) {
        continue;
      }
      const p = {
        x: a.x + dx,
        y: a.y + dy,
        data: undefined,
      };
      if (pointsEqual(b, p)) {
        return true;
      }
    }
  }
  return false;
}

export function getRow<T>(grid: T[][], row: number): T[] {
  return cloneDeep(grid[row]);
}

export function getCol<T>(grid: T[][], col: number): T[] {
  return grid.map(row => row[col]);
}

export function coordString(point: Point): string {
  return `${point.x},${point.y}`;
}

export function fromCoordString(coordString: string): Point {
  const [x, y] = coordString.split(',').map(Number);
  if (isNaN(x) || isNaN(y)) {
    throw new Error(`Could not parse coord string ${coordString}`);
  }
  return {x, y};
}

export function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

// includes from and to. return value isn't in from->to order
export function pointsAlongLine(from: Point, to: Point): Point[] {
  const points: Point[] = [];
  if (from.x === to.x) {
    // line along y
    const {x} = from;
    const [lower, upper] = [from, to].sort((a, b) => a.y - b.y);
    for (let y = lower.y; y <= upper.y; y++) {
      points.push({x, y});
    }
  } else if (from.y === to.y) {
    // line along x
    const {y} = from;
    const [lower, upper] = [from, to].sort((a, b) => a.x - b.x);
    for (let x = lower.x; x <= upper.x; x++) {
      points.push({x, y});
    }
  } else {
    throw new Error(
      `Points ${coordString(from)} and ${coordString(
        to
      )} are not along a cardinal line`
    );
  }
  return points;
}

export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

export function addPoints(a: Point, b: Point): Point {
  return {x: a.x + b.x, y: a.y + b.y};
}

export function subtractPoints(a: Point, b: Point): Point {
  return {x: a.x - b.x, y: a.y - b.y};
}

export function multiplyPoints(a: Point, b: Point): Point {
  return {x: a.x * b.x, y: a.y * b.y};
}

// perform `rotations` clockwise rotations around `origin`
export function rotateClockwise(
  p: Point,
  rotations = 1,
  origin: Point = {x: 0, y: 0}
): Point {
  let localPoint = subtractPoints(p, origin);
  times(rotations, () => {
    // clockwise rotation: swap x and y, and then negate x
    localPoint = {
      x: -localPoint.y,
      y: localPoint.x,
    };
  });
  return addPoints(localPoint, origin);
}
