import {cloneDeep, sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

interface PlayerState {
  id: number;
  current: number;
  score: number;
}

type Player = 'player1' | 'player2';

interface GameState {
  turn: Player;
  player1: PlayerState;
  player2: PlayerState;
}

// serializes current positions + scores
// doesn't care about whose turn cuz we'll do all of a player's turns at once
function serialize(game: GameState): string {
  return `${game.player1.current},${game.player1.score},${game.player2.current},${game.player2.score}`;
}

function deserialize(gameString: string, turn: Player): GameState {
  const [player1Current, player1Score, player2Current, player2Score] =
    gameString.split(',').map(Number);
  return {
    turn,
    player1: {
      id: 1,
      current: player1Current,
      score: player1Score,
    },
    player2: {
      id: 2,
      current: player2Current,
      score: player2Score,
    },
  };
}

class DeterministicDie {
  nextRoll = 1;
  rollCount = 0;

  roll(): number {
    this.rollCount++;
    const roll = this.nextRoll;
    this.nextRoll++;
    if (this.nextRoll === 101) {
      this.nextRoll = 1;
    }
    return roll;
  }
}

function takeTurn(game: GameState, outcome: number): GameState {
  game[game.turn].current += outcome;
  if (game[game.turn].current > 10) {
    game[game.turn].current %= 10;
  }
  if (game[game.turn].current === 0) {
    // special case for landing on 20 etc.
    game[game.turn].current = 10;
  }
  game[game.turn].score += game[game.turn].current;

  // console.log(
  //   `${game.turn} rolls ${rolls.join('+')} and moves to space ${
  //     game[game.turn].current
  //   } for a total score of ${game[game.turn].score}`
  // );

  game.turn = game.turn === 'player1' ? 'player2' : 'player1';

  return game;
}

function part1(initialState: GameState): number {
  const game = cloneDeep(initialState);
  const die = new DeterministicDie();

  let winner: Player | undefined;
  while (!winner) {
    const rolls = [die.roll(), die.roll(), die.roll()];
    const totalRoll = sum(rolls);
    takeTurn(game, totalRoll);
    if (game.player1.score >= 1000) {
      winner = 'player1';
    } else if (game.player2.score >= 1000) {
      winner = 'player2';
    }
  }

  const loser = winner === 'player1' ? 'player2' : 'player1';

  return die.rollCount * game[loser].score;
}

const possibleRolls = [
  {
    outcome: 3,
    count: 1,
  },
  {
    outcome: 4,
    count: 3,
  },
  {
    outcome: 5,
    count: 6,
  },
  {
    outcome: 6,
    count: 7,
  },
  {
    outcome: 7,
    count: 6,
  },
  {
    outcome: 8,
    count: 3,
  },
  {
    outcome: 9,
    count: 1,
  },
];

function part2(initialState: GameState): number {
  // key: serialized state, value: number of games in that state
  let games = new MapWithDefault<string, number>(0);
  games.set(serialize(initialState), 1);

  let player1Wins = 0;
  let player2Wins = 0;

  let turn: Player = 'player1';

  while (games.size > 0) {
    // console.log(games.size, 'active games');
    const nextGames = new MapWithDefault<string, number>(0);
    // for each game state that has games, decrement its count and increase each of its possible next states by
    // gameCount * possibiltyCount
    for (const [serializedState, gameCount] of games) {
      // console.log(serializedState, 'has', gameCount, 'instances');
      const game = deserialize(serializedState, turn);
      for (const {outcome, count} of possibleRolls) {
        const next = takeTurn(cloneDeep(game), outcome);

        if (next.player1.score >= 21) {
          player1Wins += gameCount * count;
          continue;
        } else if (next.player2.score >= 21) {
          player2Wins += gameCount * count;
          continue;
        }

        const serialized = serialize(next);
        nextGames.set(
          serialized,
          nextGames.get(serialized) + gameCount * count
        );
      }
    }
    turn = turn === 'player1' ? 'player2' : 'player1';
    games = nextGames;
  }

  return Math.max(player1Wins, player2Wins);
}

const players = fileMapSync<PlayerState>('src/2021/day21/input.txt', line => {
  const match = line.match(/Player (\d+) starting position: (\d+)/)!;
  const id = Number(match[1]);
  const start = Number(match[2]);
  return {
    id,
    current: start,
    score: 0,
  };
});

const gameState: GameState = {
  turn: 'player1',
  player1: players[0],
  player2: players[1],
};

printSolution(part1(gameState), part2(gameState));
