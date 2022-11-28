import {fileMapSync} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
}

function getLineId({start, end}: Line): string {
  return `${start.x},${start.y}->${end.x},${end.y}`;
}

function getPointId({x, y}: Point): string {
  return `${x},${y}`;
}

// bounds: Line is cheeky but good enough
function printMap(map: MapWithDefault<string, string[]>, bounds: Line) {
  for (let y = bounds.start.y; y <= bounds.end.y; y++) {
    let line = '';
    for (let x = bounds.start.x; x <= bounds.end.x; x++) {
      line += map.get(getPointId({x, y})).length || '.';
    }
    console.log(line);
  }
}

function part1(lines: Line[]): number {
  // point id -> list of line ids that cross that point
  const lineMap = new MapWithDefault<string, string[]>([]);
  // point ids of points with more than one line crossing
  const moreThanOne = new Set<string>();

  lines.forEach(line => {
    const lineId = getLineId(line);
    const {start, end} = line;

    // part 1: only worry about horizontal or vertical lines;
    if (start.x === end.x) {
      // vertical
      const startY = Math.min(start.y, end.y);
      const endY = Math.max(start.y, end.y);
      for (let y = startY; y <= endY; y++) {
        const pointId = getPointId({x: start.x, y});
        const lineList = lineMap.get(pointId);
        lineList.push(lineId);
        lineMap.set(pointId, lineList);
        if (lineList.length > 1) {
          moreThanOne.add(pointId);
        }
      }
    } else if (start.y === end.y) {
      // horizontal
      const startX = Math.min(start.x, end.x);
      const endX = Math.max(start.x, end.x);
      for (let x = startX; x <= endX; x++) {
        const pointId = getPointId({x, y: start.y});
        const lineList = lineMap.get(pointId);
        lineList.push(lineId);
        lineMap.set(pointId, lineList);
        if (lineList.length > 1) {
          moreThanOne.add(pointId);
        }
      }
    }
  });

  // printMap(lineMap, {start: {x: 0, y: 0}, end: {x: 10, y: 10}});

  return moreThanOne.size;
}

function part2(lines: Line[]): number {
  // point id -> list of line ids that cross that point
  const lineMap = new MapWithDefault<string, string[]>([]);
  // point ids of points with more than one line crossing
  const moreThanOne = new Set<string>();

  lines.forEach(line => {
    const lineId = getLineId(line);
    const {start, end} = line;

    // part 2: also diagonal
    if (start.x === end.x) {
      // vertical
      const startY = Math.min(start.y, end.y);
      const endY = Math.max(start.y, end.y);
      for (let y = startY; y <= endY; y++) {
        const pointId = getPointId({x: start.x, y});
        const lineList = lineMap.get(pointId);
        lineList.push(lineId);
        lineMap.set(pointId, lineList);
        if (lineList.length > 1) {
          moreThanOne.add(pointId);
        }
      }
    } else if (start.y === end.y) {
      // horizontal
      const startX = Math.min(start.x, end.x);
      const endX = Math.max(start.x, end.x);
      for (let x = startX; x <= endX; x++) {
        const pointId = getPointId({x, y: start.y});
        const lineList = lineMap.get(pointId);
        lineList.push(lineId);
        lineMap.set(pointId, lineList);
        if (lineList.length > 1) {
          moreThanOne.add(pointId);
        }
      }
    } else {
      // assuming it's diagonal

      // find sign (direction) of each axis
      const xDirection = Math.sign(end.x - start.x);
      const yDirection = Math.sign(end.y - start.y);

      // d is how far from start we are
      for (let d = 0; d <= Math.abs(end.x - start.x); d++) {
        // start point + number of d * direction we are going in that axis
        const point = {
          x: start.x + d * xDirection,
          y: start.y + d * yDirection,
        };
        const pointId = getPointId(point);
        const lineList = lineMap.get(pointId);
        lineList.push(lineId);
        lineMap.set(pointId, lineList);
        if (lineList.length > 1) {
          moreThanOne.add(pointId);
        }
      }
    }
  });

  printMap(lineMap, {start: {x: 0, y: 0}, end: {x: 10, y: 10}});

  return moreThanOne.size;
}

const lines = fileMapSync('src/2021/day05/input.txt', line => {
  const [start, end] = line.split(' -> ').map(coord => {
    const [x, y] = coord.split(',');
    return {
      x: Number(x),
      y: Number(y),
    };
  });
  return {
    start,
    end,
  };
});
printSolution(part1(lines), part2(lines));
