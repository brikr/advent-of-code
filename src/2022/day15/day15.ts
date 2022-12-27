import {chain} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {manhattanDistance, Point} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';
import {forEachInRange, optimizeRanges, Range} from '../../utils/range';

interface SensorBeacon {
  sensor: Point;
  beacon: Point;
  manhattan: number;
}

const TESTING = false;

function getNoBeaconRange(sensorBeacons: SensorBeacon[], y: number): Range[] {
  const ranges = sensorBeacons
    .filter(sb => sb.manhattan - Math.abs(sb.sensor.y - y) >= 0)
    .map(sb => {
      const dy = Math.abs(sb.sensor.y - y);
      return {
        min: sb.sensor.x - (sb.manhattan - dy),
        max: sb.sensor.x + (sb.manhattan - dy),
      };
    });
  // console.log(ranges);

  const optimized = optimizeRanges(ranges);
  return optimized;
}

function part1(sensorBeacons: SensorBeacon[]): number {
  const Y = TESTING ? 10 : 2000000;

  const optimized = getNoBeaconRange(sensorBeacons, Y);

  const total = optimized.reduce((acc, cur) => acc + (cur.max - cur.min), 0);

  return total;
}

function part2(sensorBeacons: SensorBeacon[]): number {
  const MAX_RANGE = {
    min: 0,
    max: TESTING ? 20 : 4000000,
  };

  let secretBeacon = {
    x: 0,
    y: 0,
  };
  forEachInRange(MAX_RANGE, y => {
    const optimized = getNoBeaconRange(sensorBeacons, y);
    // if (TESTING || y % 10000 === 0) console.log(y, optimized);

    if (optimized.length > 1) {
      // there's a gap!
      secretBeacon = {
        x: optimized[0].max + 1,
        y,
      };
    }
  });

  return secretBeacon.x * 4000000 + secretBeacon.y;
}

const sensorBeacons = fileMapSync(
  `src/2022/day15/input${TESTING ? '-test' : ''}.txt`,
  line => {
    const [sensorX, sensorY, beaconX, beaconY] = line
      .match(/-?\d+/g)!
      .map(Number);

    const sensor = {
      x: sensorX,
      y: sensorY,
    };
    const beacon = {
      x: beaconX,
      y: beaconY,
    };

    return {
      sensor,
      beacon,
      manhattan: manhattanDistance(sensor, beacon),
    };
  }
);
printSolution(part1(sensorBeacons), part2(sensorBeacons));
