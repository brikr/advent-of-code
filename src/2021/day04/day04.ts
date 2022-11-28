import {flatten, last, sum} from 'lodash';
import {transpose} from '../../utils/array';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

type BingoBoard = number[][];

interface BingoBoardWithWon {
  won: boolean;
  winningDraws?: number[];
  board: BingoBoard;
}

function hasBingo(board: BingoBoard, draws: number[]): boolean {
  // for each row
  const rowBingo = board.find(row => row.every(num => draws.includes(num)));
  if (rowBingo) {
    return true;
  }

  // for each column
  const columnBingo = transpose(board).find(row =>
    row.every(num => draws.includes(num))
  );
  if (columnBingo) {
    return true;
  }

  return false;
}

function getBoardScore(board: BingoBoard, draws: number[]): number {
  return sum(flatten(board).filter(num => !draws.includes(num))) * last(draws)!;
}

function part1(boards: BingoBoard[], draws: number[]): number {
  // find the first bingo
  for (const [idx, _] of draws.entries()) {
    const subDraws = draws.slice(0, idx);
    for (const board of boards) {
      if (hasBingo(board, subDraws)) {
        // found a winning board!
        console.log('Winning board', board, subDraws);
        return getBoardScore(board, subDraws);
      }
    }
  }

  // woops
  return -1;
}

function part2(boards: BingoBoard[], draws: number[]): number {
  // find the last bingo
  const boardsWithWon: BingoBoardWithWon[] = boards.map(board => ({
    won: false,
    board,
  }));

  let mostRecentlyWonBoard: BingoBoardWithWon | undefined = undefined;

  for (const [idx, _] of draws.entries()) {
    const subDraws = draws.slice(0, idx);
    for (const boardWithWon of boardsWithWon) {
      if (boardWithWon.won) {
        // don't bother checking
        continue;
      }

      if (hasBingo(boardWithWon.board, subDraws)) {
        // found a winning board
        boardWithWon.won = true;
        boardWithWon.winningDraws = subDraws;
        mostRecentlyWonBoard = boardWithWon;
      }
    }
  }

  if (mostRecentlyWonBoard) {
    return getBoardScore(
      mostRecentlyWonBoard.board,
      mostRecentlyWonBoard.winningDraws!
    );
  }

  // woops
  return -1;
}

const lines = fileMapSync('src/2021/day04/input.txt', line => line);

const draws = lines[0].split(',').map(Number);

const boards: BingoBoard[] = [];
let currentBoard: BingoBoard = [];

// start at third line, after the input + blank line
lines.slice(2).forEach(line => {
  if (line === '') {
    // empty line, done with this board
    boards.push(currentBoard);
    currentBoard = [];
    return;
  }

  // Read line into current board
  currentBoard.push(line.split(' ').filter(Boolean).map(Number));
});
boards.push(currentBoard);

console.log(draws);
console.log(boards);

printSolution(part1(boards, draws), part2(boards, draws));
