import {maxBy} from 'lodash';
import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function calcScore(deck: number[]): number {
  let score = 0;
  for (let i = 0; i < deck.length; i++) {
    score += deck[i] * (deck.length - i);
  }

  return score;
}

function part1(): number {
  const lines = fileLines('src/2020/day22/input.txt');
  const player1 = lines.slice(1, lines.length / 2 - 1).map(Number);
  const player2 = lines
    .slice(lines.length / 2 + 1, lines.length - 1)
    .map(Number);

  // console.log(player1, player2);

  while (player1.length > 0 && player2.length > 0) {
    const p1 = player1.shift()!;
    const p2 = player2.shift()!;
    if (p1 > p2) {
      player1.push(p1);
      player1.push(p2);
    } else {
      // p2 > p1 because there are no dupes
      player2.push(p2);
      player2.push(p1);
    }
  }

  // console.log(player1, player2);

  const winner = maxBy([player1, player2], arr => arr.length)!;

  return calcScore(winner);
}

interface RecursiveCombatResult {
  winner: '1' | '2';
  winnerDeck: number[];
}

function playRecursiveCombat(
  player1: number[],
  player2: number[]
): RecursiveCombatResult {
  const pastStates = new Set<string>();
  while (player1.length > 0 && player2.length > 0) {
    const gameState = `${player1.join(',')}|${player2.join(',')}`;
    if (pastStates.has(gameState)) {
      // p1 instantly wins
      return {
        winner: '1',
        winnerDeck: player1,
      };
    } else {
      // play gam
      pastStates.add(gameState);

      const p1 = player1.shift()!;
      const p2 = player2.shift()!;

      if (player1.length >= p1 && player2.length >= p2) {
        // play new game
        const player1Copy = [...player1.slice(0, p1)];
        const player2Copy = [...player2.slice(0, p2)];
        const result = playRecursiveCombat(player1Copy, player2Copy);
        if (result.winner === '1') {
          player1.push(p1);
          player1.push(p2);
        } else {
          player2.push(p2);
          player2.push(p1);
        }
      } else {
        // higher value wins
        if (p1 > p2) {
          player1.push(p1);
          player1.push(p2);
        } else {
          // p2 > p1
          player2.push(p2);
          player2.push(p1);
        }
      }
    }
  }

  if (player1.length > player2.length) {
    return {
      winner: '1',
      winnerDeck: player1,
    };
  } else {
    return {
      winner: '2',
      winnerDeck: player2,
    };
  }
}

function part2(): number {
  const lines = fileLines('src/2020/day22/input.txt');
  const player1 = lines.slice(1, lines.length / 2 - 1).map(Number);
  const player2 = lines
    .slice(lines.length / 2 + 1, lines.length - 1)
    .map(Number);

  // console.log(player1, player2);

  const result = playRecursiveCombat(player1, player2);

  return calcScore(result.winnerDeck);
}

printSolution(part1(), part2());
