import {cloneDeep, last} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {coordString, Direction, Point, pointsAdjacent} from '../../utils/grid';
import {sign} from '../../utils/math';
import {printSolution} from '../../utils/printSolution';

interface Instruction {
  direction: Direction;
  count: number;
}

const CHAR_TO_DIRECTION: {[key: string]: Direction} = {
  U: 'up',
  D: 'down',
  L: 'left',
  R: 'right',
};

// convert instructions to just directions as if count was always 1
function instructionsToDirections(instructions: Instruction[]): Direction[] {
  const directions: Direction[] = [];
  for (const instruction of instructions) {
    const repeated = new Array(instruction.count).fill(instruction.direction);
    directions.push(...repeated);
  }
  return directions;
}

function performMove(
  state: Point<undefined>[],
  direction: Direction
): Point<undefined>[] {
  const next = cloneDeep(state);
  const head = next[0];

  // move head
  switch (direction) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }

  // tails follow
  for (let i = 1; i < next.length; i++) {
    const ahead = next[i - 1];
    const section = next[i];
    if (!pointsAdjacent(ahead, section, true)) {
      const dx = sign(ahead.x - section.x);
      const dy = sign(ahead.y - section.y);
      section.x += dx;
      section.y += dy;
      // console.log('section updated', section);
    }
    // console.log('after moving section', i, next);
  }

  return next;
}

function part1(instructions: Instruction[]): number {
  const directions = instructionsToDirections(instructions);

  const initialState: Point<undefined>[] = [
    {
      x: 0,
      y: 0,
      data: undefined,
    },
    {
      x: 0,
      y: 0,
      data: undefined,
    },
  ];

  let current = initialState;
  const tailVisited = new Set<string>([coordString(current[1])]);

  for (const d of directions) {
    current = performMove(current, d);
    // console.log(current);
    tailVisited.add(coordString(current[1]));
  }

  return tailVisited.size;
}

function part2(instructions: Instruction[]): number {
  const directions = instructionsToDirections(instructions);

  const initialState = new Array(10).fill(undefined).map(() => ({
    x: 0,
    y: 0,
    data: undefined,
  }));

  let current = initialState;
  const tailVisited = new Set<string>([coordString(last(current)!)]);

  for (const d of directions) {
    current = performMove(current, d);
    // console.log(current);
    tailVisited.add(coordString(last(current)!));
  }

  return tailVisited.size;
}

const instructions = fileMapSync('src/2022/day09/input.txt', line => {
  const [_, dirChar, countStr] = line.match(/([UDLR]) (\d+)/)!;
  return {
    direction: CHAR_TO_DIRECTION[dirChar],
    count: Number(countStr),
  };
});
printSolution(part1(instructions), part2(instructions));
