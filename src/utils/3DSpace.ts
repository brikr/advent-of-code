import {cloneDeep, inRange, isEqual} from 'lodash';
import {MapWithDefault} from './mapWithDefault';
import {Range} from './range';

type Axis = 'x' | 'y' | 'z';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Area3D {
  x: Range;
  y: Range;
  z: Range;
}

export interface Plane3D {
  axis: Axis;
  coordinate: number;
}

export function pointToString({x, y, z}: Point3D): string {
  return `${x},${y},${z}`;
}

export function pointFromString(s: string): Point3D {
  const [x, y, z] = s.split(',').map(Number);
  return {x, y, z};
}

export function areaToString({x, y, z}: Area3D): string {
  return `${x.min}..${x.max},${y.min}..${y.max},${z.min}..${z.max}`;
}

export function areaFromString(s: string): Area3D {
  const [[xMin, xMax], [yMin, yMax], [zMin, zMax]] = s
    .split(',')
    .map(r => r.split('..').map(Number));

  return {
    x: {
      min: xMin,
      max: xMax,
    },
    y: {
      min: yMin,
      max: yMax,
    },
    z: {
      min: zMin,
      max: zMax,
    },
  };
}

export function pointInArea({x, y, z}: Point3D, area: Area3D): boolean {
  return (
    inRange(x, area.x.min, area.x.max + 1) &&
    inRange(y, area.y.min, area.y.max + 1) &&
    inRange(z, area.z.min, area.z.max + 1)
  );
}

export function getVolume(area: Area3D): number {
  const x = area.x.max - area.x.min + 1;
  const y = area.y.max - area.y.min + 1;
  const z = area.z.max - area.z.min + 1;
  return x * y * z;
}

export function areaInArea(area1: Area3D, area2: Area3D): boolean {
  return (
    inRange(area1.x.min, area2.x.min, area2.x.max + 1) &&
    inRange(area1.x.max, area2.x.min, area2.x.max + 1) &&
    inRange(area1.y.min, area2.y.min, area2.y.max + 1) &&
    inRange(area1.y.max, area2.y.min, area2.y.max + 1) &&
    inRange(area1.z.min, area2.z.min, area2.z.max + 1) &&
    inRange(area1.z.max, area2.z.min, area2.z.max + 1)
  );
}

export function getCorners(area: Area3D): Point3D[] {
  return [
    {
      x: area.x.min,
      y: area.y.min,
      z: area.z.min,
    },
    {
      x: area.x.min,
      y: area.y.min,
      z: area.z.max,
    },
    {
      x: area.x.min,
      y: area.y.max,
      z: area.z.min,
    },
    {
      x: area.x.min,
      y: area.y.max,
      z: area.z.max,
    },
    {
      x: area.x.max,
      y: area.y.min,
      z: area.z.min,
    },
    {
      x: area.x.max,
      y: area.y.min,
      z: area.z.max,
    },
    {
      x: area.x.max,
      y: area.y.max,
      z: area.z.min,
    },
    {
      x: area.x.max,
      y: area.y.max,
      z: area.z.max,
    },
  ];
}

export function areasOverlap(area1: Area3D, area2: Area3D): boolean {
  const xOverlap = area1.x.max > area2.x.min || area1.x.min < area2.x.max;
  const yOverlap = area1.y.max > area2.y.min || area1.y.min < area2.y.max;
  const zOverlap = area1.z.max > area2.z.min || area1.z.min < area2.z.max;

  return xOverlap && yOverlap && zOverlap;
}

// get 6 areas, 1 for each face. they are all 1 unit thick
// first 3 planes are the "mins", second 3 are the "maxes"
export function getFacesFromArea({x, y, z}: Area3D): Area3D[] {
  return [
    {
      x: {
        min: x.min,
        max: x.min,
      },
      y,
      z,
    },
    {
      x,
      y: {
        min: y.min,
        max: y.min,
      },
      z,
    },
    {
      x,
      y,
      z: {
        min: z.min,
        max: z.min,
      },
    },
    {
      x: {
        min: x.max,
        max: x.max,
      },
      y,
      z,
    },
    {
      x,
      y: {
        min: y.max,
        max: y.max,
      },
      z,
    },
    {
      x,
      y,
      z: {
        min: z.max,
        max: z.max,
      },
    },
  ];
}

export function getPlaneFromFace({x, y, z}: Area3D): Plane3D {
  if (x.min === x.max) {
    return {
      axis: 'x',
      coordinate: x.min,
    };
  } else if (y.min === y.max) {
    return {
      axis: 'y',
      coordinate: y.min,
    };
  } else if (z.min === z.max) {
    return {
      axis: 'z',
      coordinate: z.min,
    };
  } else {
    console.error({x, y, z});
    throw 'getPlaneFromFace blew up';
  }
}

// split an area into two areas if plane intersects area
// "side" denotes which half of the original area will include the coordinate of the plane
// be mindful if
export function splitArea(
  area: Area3D,
  plane: Plane3D,
  side: 'under' | 'over'
): Area3D[] {
  if (
    !inRange(plane.coordinate, area[plane.axis].min, area[plane.axis].max + 1)
  ) {
    // plane doesn't go through the area. no splitsies
    return [area];
  }

  // splitsies
  // under goes from area.min to plane.coord
  const under = cloneDeep(area);
  // over goes from plane.coord to area.max
  const over = cloneDeep(area);
  // the plane.coord plane will be owned by "side"

  under[plane.axis].max =
    side === 'under' ? plane.coordinate : plane.coordinate - 1;

  over[plane.axis].min =
    side === 'over' ? plane.coordinate : plane.coordinate + 1;

  // depending on "side", under or over might be negative space now. if they are, only return the remaining area
  if (under[plane.axis].max < under[plane.axis].min) {
    return [over];
  } else if (over[plane.axis].max < over[plane.axis].min) {
    return [under];
  }

  // two distinct and real regions. return em
  return [under, over];
}

// true if range1 and range2 perfectly touch and do not overlap
export function isRangeContiguous(range1: Range, range2: Range) {
  return range1.max === range2.min - 1 || range2.max === range1.min - 1;
}

// if two areas are perfectly touching (two axes match, third axis is contiguous with no overlap), return a single area
// that contains the two old areas
// if they aren't perfectly touching, return the original two areas
export function mergeAreas(area1: Area3D, area2: Area3D): Area3D[] {
  const xEqual = isEqual(area1.x, area2.x);
  const yEqual = isEqual(area1.y, area2.y);
  const zEqual = isEqual(area1.z, area2.z);
  const xContig = isRangeContiguous(area1.x, area2.x);
  const yContig = isRangeContiguous(area1.y, area2.y);
  const zContig = isRangeContiguous(area1.z, area2.z);
  if (xContig && yEqual && zEqual) {
    return [
      {
        x: {
          min: Math.min(area1.x.min, area2.x.min),
          max: Math.max(area1.x.max, area2.x.max),
        },
        y: area1.y,
        z: area1.z,
      },
    ];
  } else if (xEqual && yContig && zEqual) {
    return [
      {
        x: area1.x,
        y: {
          min: Math.min(area1.y.min, area2.y.min),
          max: Math.max(area1.y.max, area2.y.max),
        },
        z: area1.z,
      },
    ];
  } else if (xEqual && yEqual && zContig) {
    return [
      {
        x: area1.x,
        y: area1.y,
        z: {
          min: Math.min(area1.z.min, area2.z.min),
          max: Math.max(area1.z.max, area2.z.max),
        },
      },
    ];
  } else {
    return [area1, area2];
  }
}

export class AreaStorage {
  private subCubeSize;

  // key: subCube coords e.g. 0,0,0 or 0,0,1, value: set of serialized areas that cross that subcuboid
  private subCubes = new Map<string, Set<string>>();

  constructor(subCuboidSize = 100) {
    this.subCubeSize = subCuboidSize;
  }

  private getSubCubesFor(area: Area3D): Set<string>[] {
    const lowX = Math.floor(area.x.min / this.subCubeSize);
    const highX = Math.floor(area.x.max / this.subCubeSize);
    const lowY = Math.floor(area.y.min / this.subCubeSize);
    const highY = Math.floor(area.y.max / this.subCubeSize);
    const lowZ = Math.floor(area.z.min / this.subCubeSize);
    const highZ = Math.floor(area.z.max / this.subCubeSize);
    const containingSubCubes = [];
    for (let x = lowX; x <= highX; x++) {
      for (let y = lowY; y <= highY; y++) {
        for (let z = lowZ; z <= highZ; z++) {
          const set = this.subCubes.get(`${x},${y},${z}`) ?? new Set<string>();
          containingSubCubes.push(set);
        }
      }
    }
    return [];
  }

  add(area: Area3D) {
    for (const subCube of this.getSubCubesFor(area)) {
      subCube.add(areaToString(area));
    }
  }

  delete(area: Area3D) {
    for (const subCube of this.getSubCubesFor(area)) {
      subCube.delete(areaToString(area));
    }
  }

  getNearby(area: Area3D): Area3D[] {
    const nearby = new Set<string>();
    for (const subCube of this.getSubCubesFor(area)) {
      for (const areaString of subCube) {
        nearby.add(areaString);
      }
    }

    return [...nearby].map(areaFromString);
  }

  getAll(): Area3D[] {
    const allCubes = new Set<string>();
    for (const subCube of this.subCubes.values()) {
      for (const areaString of subCube) {
        allCubes.add(areaString);
      }
    }

    return [...allCubes].map(areaFromString);
  }
}
