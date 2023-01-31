import {fileMapSync} from '../../utils/file';

type CardinalDirection = 'N' | 'S' | 'E' | 'W';
type RelativeDirection = 'F';
type Turn = 'L' | 'R';
type Direction = CardinalDirection | RelativeDirection;

interface Instruction {
  direction: Direction | Turn;
  count: number;
}

function isDirection(dir: string): dir is Direction {
  return ['N', 'S', 'E', 'W', 'F'].includes(dir);
}

function rotate(
  current: CardinalDirection,
  turn: Turn,
  degrees: number
): CardinalDirection {
  const directionsCw: CardinalDirection[] = ['N', 'E', 'S', 'W'];

  let quarters = degrees / 90;
  if (turn === 'L') {
    quarters = 4 - quarters;
  }

  const currentIndex = directionsCw.indexOf(current);
  const newIndex = (currentIndex + quarters) % 4;
  return directionsCw[newIndex];
}

function part1(): number {
  const instructions = fileMapSync('src/2020/day12/input.txt', line => {
    const match = line.match(/(\w)(\d+)/);

    if (match) {
      return {
        direction: match[1] as Direction | Turn,
        count: Number(match[2]),
      };
    } else {
      return undefined;
    }
  }).filter(Boolean) as Instruction[];

  let x = 0;
  let y = 0;
  let facing: CardinalDirection = 'E';
  for (const instruction of instructions) {
    if (isDirection(instruction.direction)) {
      // we are changing position
      let moveDirection;
      if (instruction.direction === 'F') {
        moveDirection = facing;
      } else {
        moveDirection = instruction.direction;
      }

      switch (moveDirection) {
        case 'N':
          y += instruction.count;
          break;
        case 'S':
          y -= instruction.count;
          break;
        case 'E':
          x += instruction.count;
          break;
        case 'W':
          x -= instruction.count;
          break;
      }
    } else {
      // we are turning
      facing = rotate(facing, instruction.direction, instruction.count);
    }
    // console.log(
    //   `${instruction.direction}${instruction.count}: ${x},${y} facing ${facing}`
    // );
  }

  return Math.abs(x) + Math.abs(y);
}

function rotateWaypoint(
  waypointX: number,
  waypointY: number,
  turn: Turn,
  degrees: number
): [number, number] {
  let quarters = degrees / 90;
  if (turn === 'L') {
    quarters = 4 - quarters;
  }

  let newX = waypointX;
  let newY = waypointY;
  for (let i = 0; i < quarters; i++) {
    // rotate 'new' clockwise
    const tempX = newX;
    newX = newY;
    newY = -tempX;
  }

  return [newX, newY];
}

function part2(): number {
  const instructions = fileMapSync('src/2020/day12/input.txt', line => {
    const match = line.match(/(\w)(\d+)/);

    if (match) {
      return {
        direction: match[1] as Direction | Turn,
        count: Number(match[2]),
      };
    } else {
      return undefined;
    }
  }).filter(Boolean) as Instruction[];

  let shipX = 0;
  let shipY = 0;
  let waypointX = 10;
  let waypointY = 1;
  for (const instruction of instructions) {
    if (isDirection(instruction.direction)) {
      switch (instruction.direction) {
        // waypoint is changing position
        case 'N':
          waypointY += instruction.count;
          break;
        case 'S':
          waypointY -= instruction.count;
          break;
        case 'E':
          waypointX += instruction.count;
          break;
        case 'W':
          waypointX -= instruction.count;
          break;
        // ship is changing position
        case 'F':
          shipX += waypointX * instruction.count;
          shipY += waypointY * instruction.count;
          break;
      }
    } else {
      // waypoint is rotating around us
      [waypointX, waypointY] = rotateWaypoint(
        waypointX,
        waypointY,
        instruction.direction,
        instruction.count
      );
    }
    // console.log(`${instruction.direction}${instruction.count}:`);
    // console.log(`  Ship: ${shipX},${shipY}`);
    // console.log(`  Wayp: ${waypointX},${waypointY}`);
  }

  return Math.abs(shipX) + Math.abs(shipY);
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
}

printSolution();
