import {fileLines} from '../../utils/file';

function part1(): number {
  const [earliestLine, idsLine] = fileLines('src/2020/day13/input.txt');
  const earliest = Number(earliestLine);
  const ids = idsLine
    .split(',')
    .map(Number)
    .filter(id => !isNaN(id));

  let closestMod = ids[0] - (earliest % ids[0]);
  let closestModId = ids[0];
  for (const id of ids) {
    const delta = id - (earliest % id);
    if (delta < closestMod) {
      closestMod = delta;
      closestModId = id;
    }
  }

  return closestModId * closestMod;
}

function gcd(x: number, y: number): number {
  if (y === 0) {
    return x;
  } else {
    return gcd(y, x % y);
  }
}

function lcm(x: number, y: number): number {
  return Math.abs(x * y) / gcd(x, y);
}

function part2(): number {
  const [_, idsLine] = fileLines('src/2020/day13/input.txt');
  const busses = idsLine
    .split(',')
    .map((id, idx) => {
      return {
        id: Number(id),
        offset: idx,
      };
    })
    .filter(bus => !isNaN(bus.id))
    .sort((a, b) => b.id - a.id);

  const first = busses.splice(0, 1)[0];
  let delta = first.id;
  let next = busses.splice(0, 1)[0];
  let i = -first.offset;
  let answerFound = false;
  // console.log(`Current delta: ${delta}, next ID: ${next.id}`);
  while (!answerFound) {
    // console.log(i);
    i += delta;
    if ((next.id - (i % next.id)) % next.id === next.offset % next.id) {
      // found match for next bus
      // console.log(`Found match for bus ${next.id}: ${i}`);
      delta = lcm(delta, next.id);
      if (busses.length === 0) {
        answerFound = true;
      } else {
        next = busses.splice(0, 1)[0];
      }
    }
  }

  return i;
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
  // test();
}

printSolution();
