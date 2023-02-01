import {times} from 'lodash';
import {
  addPoints,
  Point,
  DIRECTION_DELTAS,
  manhattanDistance,
  coordString,
} from './../../utils/grid';
import {PointSet} from './../../utils/pointSet';
import {fileMapSync} from '../../utils/file';
import {Direction} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';
import {HashMap} from '../../utils/hashMap';

const CHAR_TO_DIR = {
  U: 'up',
  D: 'down',
  L: 'left',
  R: 'right',
} as const;

interface Instruction {
  direction: Direction;
  count: number;
}

function part1(wires: Instruction[][]): number {
  // console.log(wires);
  const wireSets: PointSet[] = [];
  for (const wire of wires) {
    let currentPosition: Point = {x: 0, y: 0};
    const set = new PointSet();
    for (const instruction of wire) {
      times(instruction.count, () => {
        currentPosition = addPoints(
          currentPosition,
          DIRECTION_DELTAS[instruction.direction]
        );
        set.add(currentPosition);
      });
    }
    wireSets.push(set);
  }
  // console.log(wireSets);

  const intersection = new PointSet();
  wireSets[0].forEach(p => {
    if (wireSets[1].has(p)) {
      intersection.add(p);
    }
  });
  // console.log(intersection);
  let closestDistance = Number.MAX_SAFE_INTEGER;
  intersection.forEach(p => {
    closestDistance = Math.min(
      closestDistance,
      manhattanDistance({x: 0, y: 0}, p)
    );
  });

  return closestDistance;
}

function part2(wires: Instruction[][]): number {
  // console.log(wires);
  const wireMaps: HashMap<Point, number>[] = [];
  for (const wire of wires) {
    let currentPosition: Point = {x: 0, y: 0};
    let distance = 0;
    const map = new HashMap<Point, number>(coordString);
    for (const instruction of wire) {
      times(instruction.count, () => {
        currentPosition = addPoints(
          currentPosition,
          DIRECTION_DELTAS[instruction.direction]
        );
        distance++;
        map.set(currentPosition, distance);
      });
    }
    wireMaps.push(map);
  }
  // console.log(wireMaps);

  const intersection = new HashMap<Point, [number, number]>(coordString);
  wireMaps[0].forEach((p, wire1Dis) => {
    const wire2Dis = wireMaps[1].get(p);
    if (wire2Dis !== undefined) {
      intersection.set(p, [wire1Dis, wire2Dis]);
    }
  });
  // console.log(intersection);
  let closestDistance = Number.MAX_SAFE_INTEGER;
  intersection.forEach((p, [wire1Dis, wire2Dis]) => {
    closestDistance = Math.min(closestDistance, wire1Dis + wire2Dis);
  });

  return closestDistance;
}

const wires = fileMapSync('src/2019/day03/input.txt', line => {
  const instructionStrs = line.split(',');
  const instructions: Instruction[] = [];
  for (const instructionStr of instructionStrs) {
    const direction =
      CHAR_TO_DIR[instructionStr.charAt(0) as keyof typeof CHAR_TO_DIR];
    const count = Number(instructionStr.substring(1));
    instructions.push({direction, count});
  }
  return instructions;
});
printSolution(part1(wires), part2(wires));
