export interface Point<T = never> {
  x: number;
  y: number;
  data: T;
}

type Direction = 'up' | 'down' | 'left' | 'right';

export function pointsAround<T>(
  map: T[][],
  x: number,
  y: number,
  directions: Direction[] = ['up', 'down', 'left', 'right']
): Point<T>[] {
  const around: Point<T>[] = [];
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

export function gridMin<T>(arr: T[][]): Point<T> {
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

export function coordString<T>(point: Point<T>): string {
  return `${point.x},${point.y}`;
}

export function pointsEqual<T>(a: Point<T>, b: Point<T>): boolean {
  return a.x === b.x && a.y === b.y;
}
