import {
  PointWithData,
  CLOCKWISE,
  addPoints,
  DIRECTION_DELTAS,
  OPPOSITE_DIRECTION,
  subtractPoints,
  multiplyPoints,
  rotateClockwise,
  pointsEqual,
} from './../../utils/grid';
import {fileLines} from '../../utils/file';
import {Point} from '../../utils/grid';
import {printSolution} from '../../utils/printSolution';
import {range, rangeRight} from 'lodash';
import {PointSet} from '../../utils/pointSet';

const TEST_MODE = false;

type GridSquare = '.' | '#' | undefined;
type Instruction = number | 'R' | 'L';
enum Direction {
  RIGHT,
  DOWN,
  LEFT,
  UP,
}
const DIRECTION_TO_STR = ['right', 'down', 'left', 'up'] as const;
const FLIP_AXIS = {
  up: 'x',
  down: 'x',
  left: 'y',
  right: 'y',
} as const;

interface State {
  location: Point;
  direction: Direction;
}

const FACE_SIZE = TEST_MODE ? 4 : 50;

const FACES = ['top', 'bottom', 'left', 'right', 'front', 'back'] as const;
type Face = typeof FACES[number];
// looking at a face from the outside, these are the other faces it touches in a clockwise formation (starting point is arbitrary)
const FACE_CONNECTIONS = {
  top: ['back', 'right', 'front', 'left'],
  bottom: ['front', 'right', 'back', 'left'],
  left: ['top', 'front', 'bottom', 'back'],
  right: ['top', 'back', 'bottom', 'front'],
  front: ['top', 'right', 'bottom', 'left'],
  back: ['top', 'left', 'bottom', 'right'],
} as const;

// information about a face on the cube net (flat map input)
interface NetFaceInformation {
  // this face on a 5x5 grid. multiply by FACE_SIZE for top left of this face on actual grid coords
  location: Point;
  // which face is in each direction
  upFace: Face;
  rightFace: Face;
  downFace: Face;
  leftFace: Face;
}

interface NetFaces {
  top: NetFaceInformation;
  bottom: NetFaceInformation;
  left: NetFaceInformation;
  right: NetFaceInformation;
  front: NetFaceInformation;
  back: NetFaceInformation;
}

// when working with local face points, this can be used as a rotation center
const FACE_CENTER: Point = {
  x: FACE_SIZE / 2 - 0.5,
  y: FACE_SIZE / 2 - 0.5,
};

interface GridSquareAndDirection {
  gridSquare: GridSquare;
  direction: Direction;
}

function getNextInDirection(
  state: State,
  grid: GridSquare[][],
  netFaces?: NetFaces
): PointWithData<GridSquareAndDirection> {
  let rawNext: Point;
  switch (state.direction) {
    case Direction.UP:
      rawNext = {x: state.location.x, y: state.location.y - 1};
      break;
    case Direction.DOWN:
      rawNext = {x: state.location.x, y: state.location.y + 1};
      break;
    case Direction.LEFT:
      rawNext = {x: state.location.x - 1, y: state.location.y};
      break;
    case Direction.RIGHT:
      rawNext = {x: state.location.x + 1, y: state.location.y};
      break;
  }
  const gridAtRaw = grid[rawNext.y]?.[rawNext.x];
  if (gridAtRaw !== undefined) {
    // no wrapping needed, can return
    return {
      ...rawNext,
      data: {
        gridSquare: gridAtRaw,
        direction: state.direction,
      },
    };
  } else {
    if (netFaces === undefined) {
      // gotta wrap
      // console.log('    doing wrap calc');
      let pointsToCheck: Point[];
      switch (state.direction) {
        case Direction.UP:
          // check bottom to top
          pointsToCheck = rangeRight(0, grid.length).map(y => ({
            x: state.location.x,
            y,
          }));
          break;
        case Direction.DOWN:
          // top to bottom
          pointsToCheck = range(0, grid.length).map(y => ({
            x: state.location.x,
            y,
          }));
          break;
        case Direction.LEFT:
          // right to left
          pointsToCheck = rangeRight(0, grid[0].length).map(x => ({
            x,
            y: state.location.y,
          }));
          break;
        case Direction.RIGHT:
          // left to right
          pointsToCheck = range(0, grid[0].length).map(x => ({
            x,
            y: state.location.y,
          }));
          break;
      }
      for (const p of pointsToCheck) {
        const gridAtP = grid[p.y][p.x];
        if (gridAtP !== undefined) {
          // found the wrap
          return {
            ...p,
            data: {
              gridSquare: gridAtP,
              direction: state.direction,
            },
          };
        }
      }
      throw 'wrapping error';
    } else {
      // console.log('    doing cube calc');
      // gotta cube
      // find the face and direction we are going to
      const directionStr = DIRECTION_TO_STR[state.direction];
      const currentFaceLocation = getFaceForPoint(state.location);
      const currentFaceStr = FACES.find(face =>
        pointsEqual(currentFaceLocation, netFaces[face].location)
      )!;
      const toFace = netFaces[currentFaceStr][`${directionStr}Face`];
      const toDirection = DIRECTION_TO_STR.findIndex(
        dir => netFaces[toFace][`${dir}Face`] === currentFaceStr
      );
      // find the number of rotations needed
      const rotations = numberOfRotations(state.direction, toDirection);
      // convert the global coordinates to local face coordinates and perform the rotation
      const localLocation = getPointOnFace(state.location);
      const rotatedLocalLocation = rotateClockwise(
        localLocation,
        rotations,
        FACE_CENTER
      );
      // "flip" the local coordinates on their axis perpendicular to rotation
      const flipAxis = FLIP_AXIS[DIRECTION_TO_STR[toDirection]];
      rotatedLocalLocation[flipAxis] =
        FACE_SIZE - 1 - rotatedLocalLocation[flipAxis];
      // move the local coordinates to the new face
      const toFaceOrigin = getFaceOrigin(netFaces[toFace].location);
      const newLocation = addPoints(rotatedLocalLocation, toFaceOrigin);
      // get the new direction (to face's direction reversed)
      const newDirection = (toDirection + 2) % 4;
      // console.log(
      //   '      old direction',
      //   directionStr,
      //   'old face',
      //   currentFaceStr,
      //   'new face',
      //   toFace,
      //   'new direction',
      //   DIRECTION_TO_STR[newDirection],
      //   'local location',
      //   localLocation,
      //   'face_center',
      //   FACE_CENTER,
      //   'number of rotations',
      //   rotations,
      //   'rotated and flipped local',
      //   rotatedLocalLocation,
      //   'new location',
      //   newLocation
      // );
      return {
        ...newLocation,
        data: {
          gridSquare: grid[newLocation.y]?.[newLocation.x],
          direction: newDirection,
        },
      };
    }
  }
}

function performInstruction(
  state: State,
  instruction: Instruction,
  grid: GridSquare[][],
  netFaces?: NetFaces
): State {
  if (instruction === 'R') {
    state.direction++;
    state.direction %= 4;
  } else if (instruction === 'L') {
    if (state.direction === 0) {
      state.direction = 3;
    } else {
      state.direction--;
    }
  } else {
    for (let step = 0; step < instruction; step++) {
      // console.log('  step', step, 'current location', state.location);
      const nextSquare = getNextInDirection(state, grid, netFaces);
      // console.log('    in front of me', nextSquare);
      if (nextSquare.data.gridSquare === '.') {
        state.location = nextSquare;
        state.direction = nextSquare.data.direction;
        // console.log('    stopped at', state.location);
      } else {
        // hit a wall, stop movement now
        // console.log('    stopped at a wall', state.location);
        break;
      }
    }
  }
  return state;
}

function part1(grid: GridSquare[][], instructions: Instruction[]): number {
  const state: State = {
    location: {
      x: grid[0].findIndex(s => s === '.'),
      y: 0,
    },
    direction: Direction.RIGHT,
  };
  // console.log('initial state', state);

  for (const instruction of instructions) {
    // console.log('performing', instruction, state);
    performInstruction(state, instruction, grid);
  }

  return (
    (state.location.y + 1) * 1000 + (state.location.x + 1) * 4 + state.direction
  );
}

// dummy info so we don't have to use partials while building this data
function defaultNetFaceInformation(face: Face): NetFaceInformation {
  return {
    location: {x: -1, y: -1},
    upFace: face,
    rightFace: face,
    downFace: face,
    leftFace: face,
  };
}

function buildNetFaces(grid: GridSquare[][]): NetFaces {
  // build a grid of cube faces in the cube net and arbitrarily assign the first face as bottom
  const cubeNetPoints = new PointSet();
  let bottomFaceLocation: Point | undefined = undefined;
  for (let y = 0; y < FACE_SIZE * 5; y += FACE_SIZE) {
    for (let x = 0; x < FACE_SIZE * 5; x += FACE_SIZE) {
      if (grid[y]?.[x] !== undefined) {
        const point = {x: x / FACE_SIZE, y: y / FACE_SIZE};
        if (!bottomFaceLocation) {
          bottomFaceLocation = point;
        }
        cubeNetPoints.add(point);
      }
    }
  }
  // console.log(cubeNetPoints);

  // assign a Face to each section of the cube net
  const netFaces: NetFaces = {
    top: defaultNetFaceInformation('top'),
    bottom: defaultNetFaceInformation('bottom'),
    left: defaultNetFaceInformation('left'),
    right: defaultNetFaceInformation('right'),
    front: defaultNetFaceInformation('front'),
    back: defaultNetFaceInformation('back'),
  };
  // arbitrarily choose the first face as the bottom
  netFaces.bottom.location = bottomFaceLocation!;
  // find the first face that's adjacent to the bottom and arbitrarily label it as the front
  // we shouldn't have to check up or left, since bottom is the first face in the list
  // check right
  const faceToTheRight = {
    x: netFaces.bottom.location.x + 1,
    y: netFaces.bottom.location.y,
  };
  if (cubeNetPoints.has(faceToTheRight)) {
    netFaces.front.location = faceToTheRight;
    netFaces.bottom.rightFace = 'front';
    netFaces.front.leftFace = 'bottom';
  } else {
    // check down
    const faceBelow = {
      x: netFaces.bottom.location.x,
      y: netFaces.bottom.location.y + 1,
    };
    if (cubeNetPoints.has(faceBelow)) {
      netFaces.front.location = faceBelow;
      netFaces.bottom.downFace = 'front';
      netFaces.front.upFace = 'bottom';
    } else {
      // no adjacent faces?
      throw 'o shit';
    }
  }

  const partiallyCompletedFaces: Face[] = ['bottom', 'front'];
  const completedFaces = new Set<string>();
  while (partiallyCompletedFaces.length > 0) {
    const faceToComplete = partiallyCompletedFaces.pop()!;
    if (completedFaces.has(faceToComplete)) {
      continue;
    }
    // console.log('completing', faceToComplete);
    // find an edge that is set
    const clockwiseIdx = CLOCKWISE.findIndex(
      dir => netFaces[faceToComplete][`${dir}Face`] !== faceToComplete
    );
    // console.log('  the edge that is set is', CLOCKWISE[clockwiseIdx]);
    // find that set face's idx in FACE_CONNECTIONS
    const faceConnectionsIdx = FACE_CONNECTIONS[faceToComplete].findIndex(
      f => f === netFaces[faceToComplete][`${CLOCKWISE[clockwiseIdx]}Face`]
    );
    // console.log(
    //   'FACE_CONNECTIONS idx',
    //   faceConnectionsIdx,
    //   'CLOCKWISE idx',
    //   clockwiseIdx
    // );
    // in a clockwise circle, set the edges of this face, and check if that face is adjacent in the net
    for (let i = 0; i < 4; i++) {
      const direction = CLOCKWISE[(i + clockwiseIdx) % 4];
      const otherFace =
        FACE_CONNECTIONS[faceToComplete][(i + faceConnectionsIdx) % 4];
      // console.log('  setting', direction, 'to', otherFace);
      netFaces[faceToComplete][`${direction}Face`] = otherFace;

      const adjacentFaceLocation = addPoints(
        netFaces[faceToComplete].location,
        DIRECTION_DELTAS[direction]
      );
      if (cubeNetPoints.has(adjacentFaceLocation)) {
        // faces are touching; set some opposite data on that face and mark it as partially complete
        netFaces[otherFace].location = adjacentFaceLocation;
        netFaces[otherFace][`${OPPOSITE_DIRECTION[direction]}Face`] =
          faceToComplete;
        partiallyCompletedFaces.push(otherFace);
      }
    }
    completedFaces.add(faceToComplete);
    // console.log('current net faces', netFaces);
  }

  return netFaces;
}

// returns the face the point lives on in the face coordinate system
function getFaceForPoint(p: Point): Point {
  return {
    x: Math.floor(p.x / FACE_SIZE),
    y: Math.floor(p.y / FACE_SIZE),
  };
}

// returns the top left corner of a face (given face coordinates) in the global coordinates
function getFaceOrigin(p: Point): Point {
  return multiplyPoints(p, {x: FACE_SIZE, y: FACE_SIZE});
}

// given a face's coordinates on face coordinate system, return the center of the face on the global coordinate system
// ! may return non-integer coordinates!
function getFaceCenter(face: Point): Point {
  return {
    x: face.x * FACE_SIZE + FACE_SIZE / 2 - 0.5,
    y: face.y * FACE_SIZE + FACE_SIZE / 2 - 0.5,
  };
}

// given a global point, return that point's coordinates relative to the face it's on
function getPointOnFace(p: Point): Point {
  return subtractPoints(p, getFaceOrigin(getFaceForPoint(p)));
}

// number of clockwise rotations needed to get from `from` to `to`
function numberOfRotations(from: Direction, to: Direction): number {
  let count = to - from;
  if (count < 0) {
    count += 4;
  }
  return count;
}

function part2(grid: GridSquare[][], instructions: Instruction[]): number {
  const netFaces = buildNetFaces(grid);
  // console.log('net faces', netFaces);

  const state: State = {
    location: {
      x: grid[0].findIndex(s => s === '.'),
      y: 0,
    },
    direction: Direction.RIGHT,
  };
  // console.log('initial state', state);

  for (const instruction of instructions) {
    // console.log('performing', instruction, state);
    performInstruction(state, instruction, grid, netFaces);
  }

  return (
    (state.location.y + 1) * 1000 + (state.location.x + 1) * 4 + state.direction
  );
}

const lines = fileLines(`src/2022/day22/input${TEST_MODE ? '-test' : ''}.txt`);
const grid: GridSquare[][] = [];
const instructions: Instruction[] = [];
let parsingGrid = true;
for (const line of lines) {
  if (line === '') {
    parsingGrid = false;
    continue;
  }
  if (parsingGrid) {
    grid.push(
      line
        .split('')
        .map<GridSquare>(char =>
          char === ' ' ? undefined : (char as GridSquare)
        )
    );
  } else {
    let currentMoveNumbers = '';
    for (const char of line.split('')) {
      if (char === 'R' || char === 'L') {
        // got to a turn. build the current move number and append it + the rotation
        const moveInstruction = Number(currentMoveNumbers);
        if (moveInstruction) {
          instructions.push(moveInstruction);
          currentMoveNumbers = '';
        }
        instructions.push(char);
      } else {
        // keep building the current number
        currentMoveNumbers += char;
      }
    }
    // in case we end with numbers, build the final move instruction
    const moveInstruction = Number(currentMoveNumbers);
    if (moveInstruction) {
      instructions.push(moveInstruction);
    }
  }
}
printSolution(part1(grid, instructions), part2(grid, instructions));
