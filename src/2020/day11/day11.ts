import {cloneDeep} from 'lodash';
import {fileMapSync} from '../../utils/file';

type FieldSquare = 'L' | '#' | '.';
type Field = FieldSquare[][];

function countAdjecentOccupied1(
  field: Field,
  row: number,
  col: number
): number {
  let count = 0;
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r === row && c === col) {
        continue;
      }

      if (field?.[r]?.[c] === '#') {
        count++;
      }
    }
  }

  return count;
}

function step1(field: Field): Field {
  const next = cloneDeep(field);
  for (let row = 0; row < field.length; row++) {
    for (let col = 0; col < field[row].length; col++) {
      switch (field[row][col]) {
        case 'L':
          // If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
          if (countAdjecentOccupied1(field, row, col) === 0) {
            next[row][col] = '#';
          }
          break;
        case '#':
          // If a seat is occupied (#) and four or more seats adjacent to it are also occupied, the seat becomes empty.
          if (countAdjecentOccupied1(field, row, col) >= 4) {
            next[row][col] = 'L';
          }
          break;
        case '.':
          // do nothin
          break;
      }
    }
  }
  return next;
}

function fieldToString(field: Field) {
  return field.map(row => row.join('')).join('\n') + '\n';
}

function part1(): number {
  const field = fileMapSync(
    'src/2020/day11/input.txt',
    line => line.split('') as FieldSquare[]
  ).filter(row => row.length > 0);

  let last = field;
  let next = step1(field);
  while (fieldToString(next) !== fieldToString(last)) {
    last = next;
    next = step1(next);
  }

  // Count the total number of occupied seats (#) in the field.
  return next.reduce((totalCount, row) => {
    return (
      totalCount +
      row.reduce((rowCount, square) => {
        return rowCount + (square === '#' ? 1 : 0);
      }, 0)
    );
  }, 0);
}

function countAdjecentOccupied2(
  field: Field,
  row: number,
  col: number
): number {
  let count = 0;
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) {
        continue;
      }

      // Keep searching in the direction until we see something other than floor
      let delta = 1;
      while (field?.[row + r * delta]?.[col + c * delta] === '.') {
        delta++;
      }

      if (field?.[row + r * delta]?.[col + c * delta] === '#') {
        count++;
      }
    }
  }

  return count;
}

function step2(field: Field): Field {
  const next = cloneDeep(field);
  for (let row = 0; row < field.length; row++) {
    for (let col = 0; col < field[row].length; col++) {
      switch (field[row][col]) {
        case 'L':
          // If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
          if (countAdjecentOccupied2(field, row, col) === 0) {
            next[row][col] = '#';
          }
          break;
        case '#':
          // If a seat is occupied (#) and four or more seats adjacent to it are also occupied, the seat becomes empty.
          if (countAdjecentOccupied2(field, row, col) >= 5) {
            next[row][col] = 'L';
          }
          break;
        case '.':
          // do nothin
          break;
      }
    }
  }
  return next;
}

function part2(): number {
  const field = fileMapSync(
    'src/2020/day11/input.txt',
    line => line.split('') as FieldSquare[]
  ).filter(row => row.length > 0);

  let last = field;
  let next = step2(field);
  while (fieldToString(next) !== fieldToString(last)) {
    last = next;
    next = step2(next);
  }

  // Count the total number of occupied seats (#) in the field.
  return next.reduce((totalCount, row) => {
    return (
      totalCount +
      row.reduce((rowCount, square) => {
        return rowCount + (square === '#' ? 1 : 0);
      }, 0)
    );
  }, 0);
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
}

printSolution();
