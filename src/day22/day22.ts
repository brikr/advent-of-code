import {
  Area3D,
  areaFromString,
  areaInArea,
  areasOverlap,
  areaToString,
  getFacesFromArea,
  getPlaneFromFace,
  getVolume,
  mergeAreas,
  pointToString,
  splitArea,
} from '../utils/3dspace';
import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';
import {Range} from '../utils/range';

interface Instruction {
  // true=on, false=off
  state: boolean;
  area: Area3D;
}

const negPosFifty: Range = {
  min: -50,
  max: 50,
};
const initializationArea: Area3D = {
  x: negPosFifty,
  y: negPosFifty,
  z: negPosFifty,
};

function part1(instructions: Instruction[]): number {
  // key: serialized point
  const onCubes = new Set<string>();

  for (const instruction of instructions) {
    if (areaInArea(instruction.area, initializationArea)) {
      for (let x = instruction.area.x.min; x <= instruction.area.x.max; x++) {
        for (let y = instruction.area.y.min; y <= instruction.area.y.max; y++) {
          for (
            let z = instruction.area.z.min;
            z <= instruction.area.z.max;
            z++
          ) {
            if (instruction.state) {
              onCubes.add(pointToString({x, y, z}));
            } else {
              onCubes.delete(pointToString({x, y, z}));
            }
          }
        }
      }
    }
  }
  return onCubes.size;
}

function cullAreas(areas: Set<string>): Set<string> {
  const newAreas = new Set<string>();
  a1: for (const area1String of areas) {
    const area1 = areaFromString(area1String);
    for (const area2String of areas) {
      const area2 = areaFromString(area2String);
      const fresh = mergeAreas(area1, area2);
      if (fresh.length === 1) {
        // don't try to merge this area with any other areas
        areas.delete(area1String);
        newAreas.add(areaToString(fresh[0]));
        continue a1;
      }
      // else no mergey, just keep trying area1 with other areas
    }
    // if we get here, area1 found no mates
    newAreas.add(area1String);
  }
  return newAreas;
}

function cullUntilDone(areas: Set<string>): Set<string> {
  console.log('    culling', [...areas].join(';'));
  let lastSize = 0;
  let size = areas.size;
  while (size !== lastSize) {
    lastSize = size;
    areas = cullAreas(areas);
    size = areas.size;
  }
  console.log('    result', [...areas].join(';'));
  return areas;
}

function getTotalVolume(cubes: Set<string>): number {
  let totalVolume = 0;
  for (const cubeString of cubes) {
    const cube = areaFromString(cubeString);
    totalVolume += getVolume(cube);
  }
  return totalVolume;
}

function part2(instructions: Instruction[]): number {
  // key: serialized area
  let onCubes = new Set<string>();

  for (const instruction of instructions) {
    console.log(
      'parsing instruction',
      instruction.state,
      areaToString(instruction.area)
    );
    // split all existing cubes on the planes of the new cube
    for (const [idx, face] of getFacesFromArea(instruction.area).entries()) {
      // console.log('  splitting all cubes on face', areaToString(face));
      const side = idx < 3 ? 'over' : 'under';
      const newOnCubes = new Set<string>();
      for (const cubeString of onCubes) {
        const cube = areaFromString(cubeString);
        if (areasOverlap(cube, face)) {
          // splitting needed
          // console.log('    splitting', cubeString);
          const plane = getPlaneFromFace(face);
          const newCubes = splitArea(cube, plane, side);
          for (const newCube of newCubes) {
            newOnCubes.add(areaToString(newCube));
          }
          // console.log('      result', newCubes.map(areaToString).join(';'));
        } else {
          // no split
          // console.log('    not splitting', cubeString);
          newOnCubes.add(cubeString);
        }
      }
      onCubes = newOnCubes;
    }
    // for each cube, if it's completely inside the new cube, delete it
    for (const cubeString of onCubes) {
      const cube = areaFromString(cubeString);
      // console.log(
      //   '  checking if',
      //   cubeString,
      //   'is in',
      //   areaToString(instruction.area)
      // );
      if (areaInArea(cube, instruction.area)) {
        // console.log('    it is');
        onCubes.delete(cubeString);
      }
    }
    // if the new cube is lit, add it to the cube collection
    if (instruction.state) {
      onCubes.add(areaToString(instruction.area));
    }

    console.log('  total cubes', onCubes.size);
    // console.log('  total cells', getTotalVolume(onCubes));
  }

  return getTotalVolume(onCubes);
}

const instructions = fileMapSync<Instruction>('src/day22/input.txt', line => {
  const match = line.match(
    /(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)/
  )!;
  return {
    state: match[1] === 'on',
    area: {
      x: {
        min: Number(match[2]),
        max: Number(match[3]),
      },
      y: {
        min: Number(match[4]),
        max: Number(match[5]),
      },
      z: {
        min: Number(match[6]),
        max: Number(match[7]),
      },
    },
  };
});
printSolution(part1(instructions), part2(instructions));
