import {sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

type RPS = 'R' | 'P' | 'S';
type XYZ = 'X' | 'Y' | 'Z';

interface Round {
  them: RPS;
  col2: XYZ;
}

const TO_RPS: {[key: string]: RPS} = {
  A: 'R',
  B: 'P',
  C: 'S',
  X: 'R',
  Y: 'P',
  Z: 'S',
};

const POINTS = {
  R: 1,
  P: 2,
  S: 3,
} as const;

const BEATS = {
  R: 'S',
  P: 'R',
  S: 'P',
} as const;

const LOSES = {
  R: 'P',
  P: 'S',
  S: 'R',
} as const;

function calculatePoints(them: RPS, me: RPS): number {
  const shapePoints = POINTS[me];

  let outcomePoints: number;
  if (them === me) {
    outcomePoints = 3;
  } else if (BEATS[me] === them) {
    // i win
    outcomePoints = 6;
  } else {
    // i lose
    outcomePoints = 0;
  }

  return shapePoints + outcomePoints;
}

function part1(rounds: Round[]): number {
  return sum(
    rounds.map(({them, col2: me}) => calculatePoints(them, TO_RPS[me]))
  );
}

function part2(rounds: Round[]): number {
  return sum(
    rounds.map(({them, col2: outcome}) => {
      let me: RPS;
      switch (outcome) {
        case 'X':
          // i need to lose
          me = BEATS[them];
          break;
        case 'Y':
          // i need to draw
          me = them;
          break;
        case 'Z':
          // i need to win
          me = LOSES[them];
          break;
      }
      return calculatePoints(them, me);
    })
  );
}

const rounds = fileMapSync('src/2022/day02/input.txt', line => {
  const [them, col2] = line.split(' ');

  return {
    them: TO_RPS[them],
    col2,
  } as Round;
});
printSolution(part1(rounds), part2(rounds));
