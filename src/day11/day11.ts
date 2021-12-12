import {sum, times} from 'lodash';
import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

function printMap(octopi: number[][]) {
  for (let y = 0; y < octopi.length; y++) {
    console.log(octopi[y].join(''));
  }
}

// flashes if greater than 9, then increases neighbors
// if anything flashes, it gets set to zero
// cells that are zero won't ever get increased
// returns number of flashes
function handleFlashesOnce(octopi: number[][]): number {
  let numFlashes = 0;
  octopi.forEach((row, rowIdx) => {
    row.forEach((octopus, colIdx) => {
      if (octopus > 9) {
        // explod
        numFlashes++;
        console.log('explod at', rowIdx, colIdx);
        octopi[rowIdx][colIdx] = 0;
        // increase everything around
        for (let r = rowIdx - 1; r <= rowIdx + 1; r++) {
          for (let c = colIdx - 1; c <= colIdx + 1; c++) {
            // increase if defined and not zero
            // not worried about the center (self) case here since we just set it to zero
            if (octopi[r]?.[c]) {
              octopi[r][c]++;
            }
          }
        }
      }
    });
  });
  return numFlashes;
}

function part1(originalOctopi: number[][]): number {
  let numFlashes = 0;
  let octopi = originalOctopi;
  times(100, step => {
    // increase all by one (and make a copy)
    const nextOctopi = octopi.map(row => row.map(octopus => octopus + 1));

    // handle flashes until they don't happen anymore
    let newFlashes = 0;
    while ((newFlashes = handleFlashesOnce(nextOctopi))) {
      console.debug('flashin', newFlashes);
      numFlashes += newFlashes;
    }

    octopi = nextOctopi;
    console.log(`After ${step + 1} steps (${numFlashes} flashes)`);
    printMap(octopi);
  });
  return numFlashes;
}

function part2(originalOctopi: number[][]): number {
  let numFlashes = 0;
  let octopi = originalOctopi;
  let sync = false;
  let step = 0;
  while (!sync) {
    // increase all by one (and make a copy)
    const nextOctopi = octopi.map(row => row.map(octopus => octopus + 1));

    // handle flashes until they don't happen anymore
    let newFlashes = 0;
    while ((newFlashes = handleFlashesOnce(nextOctopi))) {
      console.debug('flashin', newFlashes);
      numFlashes += newFlashes;
    }

    octopi = nextOctopi;
    console.log(`After ${step + 1} steps (${numFlashes} flashes)`);
    printMap(octopi);

    if (sum(octopi.map(sum)) === 0) {
      console.log('Sync!');
      sync = true;
    }
    step++;
  }
  return step;
}

const lines = fileMapSync('src/day11/input.txt', line =>
  line.split('').map(Number)
);
printSolution(part1(lines), part2(lines));
