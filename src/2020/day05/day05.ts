import {fileMap} from '../../utils/file';

// Basically like a binary search, except you're following instructions instead of comparing
function getSeatId(sequence: string): number {
  let low = 0;
  let high = 127;

  for (const char of sequence.substr(0, 7).split('')) {
    if (char === 'F') {
      high = Math.floor((low + high) / 2);
    } else {
      low = Math.floor((low + high) / 2 + 1);
    }
  }

  const row = low;

  low = 0;
  high = 7;

  for (const char of sequence.substr(7, 3).split('')) {
    if (char === 'L') {
      high = Math.floor((low + high) / 2);
    } else {
      low = Math.floor((low + high) / 2 + 1);
    }
  }

  const col = low;

  return row * 8 + col;
}

async function part1(): Promise<number> {
  let highestSeatId = 0;

  await fileMap('src/2020/day05/input.txt', line => {
    const seatId = getSeatId(line);
    if (seatId > highestSeatId) {
      highestSeatId = seatId;
    }
  });

  return highestSeatId;
}

async function part2(): Promise<number> {
  // 127 * 8 + 8 seats on the plane
  const seats = new Array(1023).fill(false);

  await fileMap('src/2020/day05/input.txt', line => {
    const seatId = getSeatId(line);
    seats[seatId] = true;
  });

  // Keep track of when we've found the start of the actual seats
  // Once we have, find the first false seat and return it
  let foundStartOfPlane = false;
  for (let i = 0; i < seats.length; i++) {
    if (seats[i]) {
      foundStartOfPlane = true;
    } else {
      if (foundStartOfPlane) {
        return i;
      }
    }
  }

  return 0;
}

async function printSolution() {
  console.log('Part 1:');
  console.log(await part1());
  console.log('Part 2:');
  console.log(await part2());
}

printSolution();
