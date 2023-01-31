import {max, min} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Coords {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface Range {
  min: number;
  max: number;
}

interface Bounds {
  x: Range;
  y: Range;
  z: Range;
  w: Range;
}

function coordsToString(coords: Coords) {
  return `${coords.x},${coords.y},${coords.z},${coords.w}`;
}

class PocketDimension {
  bounds: Bounds = {
    x: {
      min: 0,
      max: 0,
    },
    y: {
      min: 0,
      max: 0,
    },
    z: {
      min: 0,
      max: 0,
    },
    w: {
      min: 0,
      max: 0,
    },
  };

  private fourD: boolean;
  private set = new Set<string>();

  constructor(fourD?: boolean) {
    this.fourD = fourD ?? false;
  }

  has(coords: Coords): boolean {
    return this.set.has(coordsToString(coords));
  }

  add(coords: Coords) {
    this.bounds.x.min = min([this.bounds.x.min, coords.x])!;
    this.bounds.y.min = min([this.bounds.y.min, coords.y])!;
    this.bounds.z.min = min([this.bounds.z.min, coords.z])!;
    this.bounds.w.min = min([this.bounds.w.min, coords.w])!;
    this.bounds.x.max = max([this.bounds.x.max, coords.x])!;
    this.bounds.y.max = max([this.bounds.y.max, coords.y])!;
    this.bounds.z.max = max([this.bounds.z.max, coords.z])!;
    this.bounds.w.max = max([this.bounds.w.max, coords.w])!;

    this.set.add(coordsToString(coords));
  }

  activeNeighborCount(coords: Coords): number {
    let count = 0;

    for (let x = coords.x - 1; x <= coords.x + 1; x++) {
      for (let y = coords.y - 1; y <= coords.y + 1; y++) {
        for (let z = coords.z - 1; z <= coords.z + 1; z++) {
          const [minW, maxW] = this.fourD
            ? [coords.w - 1, coords.w + 1]
            : [0, 0];
          for (let w = minW; w <= maxW; w++) {
            if (coordsToString(coords) === coordsToString({x, y, z, w})) {
              continue;
            }
            if (this.has({x, y, z, w})) {
              count++;
            }
          }
        }
      }
    }
    return count;
  }

  values(): Coords[] {
    const coords: Coords[] = [];
    for (const coord of this.set.values()) {
      const [x, y, z, w] = coord.split(',').map(Number);
      coords.push({x, y, z, w});
    }
    return coords;
  }

  cycle(): PocketDimension {
    const next = new PocketDimension(this.fourD);

    for (let x = this.bounds.x.min - 1; x <= this.bounds.x.max + 1; x++) {
      for (let y = this.bounds.y.min - 1; y <= this.bounds.y.max + 1; y++) {
        for (let z = this.bounds.z.min - 1; z <= this.bounds.z.max + 1; z++) {
          const [minW, maxW] = this.fourD
            ? [this.bounds.w.min - 1, this.bounds.w.max + 1]
            : [0, 0];
          for (let w = minW; w <= maxW; w++) {
            const active = this.has({x, y, z, w});
            const neighbors = this.activeNeighborCount({x, y, z, w});
            if (active) {
              if (neighbors === 2 || neighbors === 3) {
                // cube remains active
                next.add({x, y, z, w});
              }
            } else {
              if (neighbors === 3) {
                // cube becomes active
                next.add({x, y, z, w});
              }
            }
          }
        }
      }
    }

    return next;
  }
}

function part1(): number {
  const cubes = new PocketDimension();

  fileMapSync('src/2020/day17/input.txt', (line, y) => {
    if (line) {
      const chars = line.split('');
      for (let x = 0; x < chars.length; x++) {
        if (chars[x] === '#') {
          cubes.add({x, y, z: 0, w: 0});
        }
      }
    }
  });

  // console.log(`0: ${cubes.values().length}`);
  // console.log(cubes);
  let next = cubes;
  for (let i = 1; i <= 6; i++) {
    next = next.cycle();
    // console.log(`${i}: ${next.values().length}`);
    // console.log(next);
  }

  return next.values().length;
}

function part2(): number {
  const cubes = new PocketDimension(true);

  fileMapSync('src/2020/day17/input.txt', (line, y) => {
    if (line) {
      const chars = line.split('');
      for (let x = 0; x < chars.length; x++) {
        if (chars[x] === '#') {
          cubes.add({x, y, z: 0, w: 0});
        }
      }
    }
  });

  // console.log(`0: ${cubes.values().length}`);
  // console.log(cubes);
  let next = cubes;
  for (let i = 1; i <= 6; i++) {
    next = next.cycle();
    // console.log(`${i}: ${next.values().length}`);
    // console.log(next);
  }

  return next.values().length;
}

printSolution(part1(), part2());
