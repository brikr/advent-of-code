import {Point3D} from '../../utils/3dspace';
import {fileLines} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

function add(p1: Point3D, p2: Point3D): Point3D {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
    z: p1.z + p2.z,
  };
}

function subtract(p1: Point3D, p2: Point3D): Point3D {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
    z: p1.z - p2.z,
  };
}

function pointToString({x, y, z}: Point3D): string {
  return `${x},${y},${z}`;
}

interface ScannerData {
  id: number;
  beacons: Point3D[];
}

type Axis = keyof Point3D;
type Sign = 1 | -1;

interface RotationAxis {
  newAxis: Axis;
  sign: Sign;
}

interface RotationVector {
  x: RotationAxis;
  y: RotationAxis;
  z: RotationAxis;
}

function getSign(a: number, b: number): Sign {
  if (Math.abs(a) !== Math.abs(b)) {
    console.log(a, b);
    throw 'getSign blew up';
  }
  return (a / b) as Sign;
}

// gets a rotation vector that could be applied to v2 to turn it into v1
// v1 and v2 need to have exact same magnitude/unoriented direction
function getRotationVector(v1: Point3D, v2: Point3D): RotationVector {
  let newXAxis: Axis;
  let newYAxis: Axis;
  let newZAxis: Axis;

  if (Math.abs(v2.x) === Math.abs(v1.x)) {
    newXAxis = 'x';
  } else if (Math.abs(v2.x) === Math.abs(v1.y)) {
    newXAxis = 'y';
  } else if (Math.abs(v2.x) === Math.abs(v1.z)) {
    newXAxis = 'z';
  } else {
    console.log(v1, v2);
    throw 'getRotationVector blew up';
  }

  if (Math.abs(v2.y) === Math.abs(v1.x)) {
    newYAxis = 'x';
  } else if (Math.abs(v2.y) === Math.abs(v1.y)) {
    newYAxis = 'y';
  } else if (Math.abs(v2.y) === Math.abs(v1.z)) {
    newYAxis = 'z';
  } else {
    console.log(v1, v2);
    throw 'getRotationVector blew up';
  }

  if (Math.abs(v2.z) === Math.abs(v1.x)) {
    newZAxis = 'x';
  } else if (Math.abs(v2.z) === Math.abs(v1.y)) {
    newZAxis = 'y';
  } else if (Math.abs(v2.z) === Math.abs(v1.z)) {
    newZAxis = 'z';
  } else {
    console.log(v1, v2);
    throw 'getRotationVector blew up';
  }

  return {
    x: {
      newAxis: newXAxis,
      sign: getSign(v2.x, v1[newXAxis]),
    },
    y: {
      newAxis: newYAxis,
      sign: getSign(v2.y, v1[newYAxis]),
    },
    z: {
      newAxis: newZAxis,
      sign: getSign(v2.z, v1[newZAxis]),
    },
  };
}

function applyRotationVector(
  point: Point3D,
  rotation: RotationVector
): Point3D {
  return {
    [rotation.x.newAxis]: point.x * rotation.x.sign,
    [rotation.y.newAxis]: point.y * rotation.y.sign,
    [rotation.z.newAxis]: point.z * rotation.z.sign,
  } as unknown as Point3D;
}

function createMagnitudeMatrix(points: Point3D[]): string[][] {
  const matrix: string[][] = points.map(() => new Array(points.length));

  for (const [idx1, point1] of points.entries()) {
    for (const [idx2, point2] of points.entries()) {
      const xDistance = Math.abs(point1.x - point2.x);
      const yDistance = Math.abs(point1.y - point2.y);
      const zDistance = Math.abs(point1.z - point2.z);
      const sorted = [xDistance, yDistance, zDistance]
        .sort((a, b) => a - b)
        .join(',');
      // console.debug(sorted);
      // const total = xDistance + yDistance + zDistance;
      matrix[idx1][idx2] = sorted;
      matrix[idx2][idx1] = sorted;
    }
  }

  return matrix;
}

interface SameEntriesResponse {
  count: number;
  zeroMatch?: {
    arr1Idx: number;
    arr2Idx: number;
  };
  anotherMatch?: {
    arr1Idx: number;
    arr2Idx: number;
  };
}

// returns the number of entries that exist in both arrays
function countSameEntries(arr1: string[], arr2: string[]): SameEntriesResponse {
  const arr1Counts = new MapWithDefault<string, number>(0);
  const arr1Reverse = new Map<string, number>();
  for (const [idx, val] of arr1.entries()) {
    arr1Counts.set(val, arr1Counts.get(val) + 1);
    arr1Reverse.set(val, idx);
  }

  const response: SameEntriesResponse = {
    count: 0,
  };
  for (const [idx, val] of arr2.entries()) {
    const arr1Count = arr1Counts.get(val);
    if (arr1Count > 0) {
      response.count++;
      arr1Counts.set(val, arr1Count - 1);

      if (val === '0,0,0') {
        response.zeroMatch = {
          arr1Idx: arr1Reverse.get('0,0,0')!,
          arr2Idx: idx,
        };
      } else if (arr1Count === 1 && response.anotherMatch === undefined) {
        // set any other match, but make sure it's a match that there was only one of
        response.anotherMatch = {
          arr1Idx: arr1Reverse.get(val)!,
          arr2Idx: idx,
        };
      }
    }
  }

  return response;
}

// given an oriented global map and unoriented set of new coordinates, try to attach the new coordinates to the global
// map (modifying the input)
// returns the coordinates relative to global of the new scanner if it attached, or undefined if it didn't
function addToGlobalMap(
  globalMap: Point3D[],
  newScanner: ScannerData
): Point3D | undefined {
  const globalAdjacency = createMagnitudeMatrix(globalMap);
  const newAdjacency = createMagnitudeMatrix(newScanner.beacons);

  // see if we can find a row of the newAdjacency that has at least 12 matching elements to a row in the global adjacency
  for (const newRow of newAdjacency) {
    for (const globalRow of globalAdjacency) {
      const shared = countSameEntries(newRow, globalRow);
      if (shared.count >= 12) {
        // console.log('  found match!', shared.count);

        // convert shared.zeroMatch and anotherMatch to the actual points in the two sets
        const globalZero = globalMap[shared.zeroMatch!.arr2Idx];
        const globalAnother = globalMap[shared.anotherMatch!.arr2Idx];
        const globalZToA = subtract(globalAnother, globalZero);

        const newZero = newScanner.beacons[shared.zeroMatch!.arr1Idx];
        const newAnother = newScanner.beacons[shared.anotherMatch!.arr1Idx];
        const newZToA = subtract(newAnother, newZero);

        // console.log('  global', globalZero, globalAnother, globalZToA);
        // console.log('  new', newZero, newAnother, newZToA);

        const rotationVector = getRotationVector(globalZToA, newZToA);
        // console.log('  new to global rotation', rotationVector);

        const rotatedNewMap = newScanner.beacons.map(p =>
          applyRotationVector(p, rotationVector)
        );

        const transformVector = subtract(
          globalZero,
          applyRotationVector(newZero, rotationVector)
        );
        // console.log(
        //   '  position of the scanner relative to global',
        //   transformVector
        // );
        const transformedNewMap = rotatedNewMap.map(p =>
          add(p, transformVector)
        );

        // console.debug(
        //   '  new zero rotated',
        //   applyRotationVector(newZero, rotationVector)
        // );
        // console.debug(
        //   '  new zero rotated + transformed',
        //   add(applyRotationVector(newZero, rotationVector), transformVector)
        // );

        globalMap.push(...transformedNewMap);

        return transformVector;
      }
    }
  }

  return undefined;
}

function part1(scanners: ScannerData[]): number {
  // orient around scanner 0
  const globalMap = scanners[0].beacons;
  const scannerQueue = scanners.slice(1);

  while (scannerQueue.length > 0) {
    // dequeue the next scanner
    const scanner = scannerQueue.splice(0, 1)[0];

    // console.log(`trying to attach scanner ${scanner.id} to global map`);

    // try to attach to global map
    const scannerPosition = addToGlobalMap(globalMap, scanner);
    if (!scannerPosition) {
      // console.log('  no match');
      // enqueue if it failed
      scannerQueue.push(scanner);
    } else {
      console.log(scannerQueue.length, 'scanners remaining');
      // console.log('new global map');
      // for (const p of sortBy(globalMap, ['x', 'y', 'z'])) {
      //   console.log('  ', pointToString(p));
      // }
    }
  }

  const beaconSet = new Set(globalMap.map(pointToString));

  return beaconSet.size;
}

function part2(scanners: ScannerData[]): number {
  // orient around scanner 0
  const globalMap = scanners[0].beacons;
  const scannerQueue = scanners.slice(1);
  const scannerPositions: Point3D[] = [{x: 0, y: 0, z: 0}];

  while (scannerQueue.length > 0) {
    // dequeue the next scanner
    const scanner = scannerQueue.splice(0, 1)[0];

    // console.log(`trying to attach scanner ${scanner.id} to global map`);

    // try to attach to global map
    const scannerPosition = addToGlobalMap(globalMap, scanner);
    if (!scannerPosition) {
      // console.log('  no match');
      // enqueue if it failed
      scannerQueue.push(scanner);
    } else {
      console.log(scannerQueue.length, 'scanners remaining');
      scannerPositions.push(scannerPosition);
      // console.log('new global map');
      // for (const p of sortBy(globalMap, ['x', 'y', 'z'])) {
      //   console.log('  ', pointToString(p));
      // }
    }
  }

  let max = 0;
  for (const s1 of scannerPositions) {
    for (const s2 of scannerPositions) {
      const xDistance = Math.abs(s1.x - s2.x);
      const yDistance = Math.abs(s1.y - s2.y);
      const zDistance = Math.abs(s1.z - s2.z);
      const total = xDistance + yDistance + zDistance;
      max = Math.max(total, max);
    }
  }

  return max;
}

const lines = fileLines('src/2021/day19/input.txt');

const scanners: ScannerData[] = [];
let currentScanner: ScannerData = {
  id: 0,
  beacons: [],
};
for (const line of lines) {
  if (line.startsWith('---')) {
    // header data, ignore
  } else if (line === '') {
    // done reading for this scanner, push to list
    scanners.push(currentScanner);
    currentScanner = {
      id: currentScanner.id + 1,
      beacons: [],
    };
  } else {
    // read some coords
    const [x, y, z] = line.split(',').map(Number);
    currentScanner.beacons.push({x, y, z});
  }
}
scanners.push(currentScanner);

// console.log(scanners);

printSolution(part1(scanners), part2(scanners));
