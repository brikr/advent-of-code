import {cloneDeep} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

const DAYS_TO_MATURE = 2;
const GESTATION_TOP = 6; // internal timer goes here after having baby
const FRESH_TIMER = GESTATION_TOP + DAYS_TO_MATURE; // fresh fish starts at 8

function part1(originalFish: number[]): number {
  let fish = cloneDeep(originalFish);
  for (let i = 0; i < 80; i++) {
    const newFish = [];
    for (const [idx, timer] of fish.entries()) {
      if (timer === 0) {
        // if the internal timer is already zero, repopulate and reset timer
        newFish.push(FRESH_TIMER);
        fish[idx] = GESTATION_TOP;
      } else {
        // otherwise, decrement
        fish[idx] = timer - 1;
      }
    }
    // update fish to have new fish
    fish = fish.concat(newFish);
  }
  return fish.length;
}

function part2(originalFish: number[]): number {
  // key: internal timer, value: number of fish at that timer
  let fish = new MapWithDefault<number, number>(0);
  originalFish.forEach(timer => {
    const count = fish.get(timer);
    fish.set(timer, count + 1);
  });

  for (let i = 0; i < 256; i++) {
    // console.log('day', i);
    const newFish = new MapWithDefault<number, number>(0);

    for (const [timer, count] of fish.entries()) {
      // console.debug('map', timer, count);
      if (timer === 0) {
        // all the babies
        newFish.set(FRESH_TIMER, count);
        // all the mothers
        const prevCount = newFish.get(GESTATION_TOP);
        newFish.set(GESTATION_TOP, prevCount + count);
      } else {
        // "decrement"
        const prevCount = newFish.get(timer - 1);
        newFish.set(timer - 1, prevCount + count);
      }
    }
    fish = newFish;
    // console.debug('sum', sum);
  }

  let sum = 0;
  for (const count of fish.values()) {
    sum += count;
  }

  return sum;
}

const fish = fileMapSync('src/2021/day06/input.txt', line =>
  line.split(',').map(Number)
)[0];
printSolution(part1(fish), part2(fish));
