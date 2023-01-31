import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface UnlinkedCup {
  value: number;
  next?: UnlinkedCup;
}

interface Cup {
  value: number;
  next: Cup;
}

// picks up 3 cups to the right of the specific cup. returns the first cup in the picked up list
function pickUp3(cup: Cup): Cup {
  const pickedUp = cup.next;
  cup.next = cup.next.next.next.next;
  return pickedUp;
}

function findDestination(
  start: Cup,
  pickedUp: Cup,
  length: number,
  valueToCup: Map<number, Cup>
): Cup {
  const pickedUpValues = new Set([
    pickedUp.value,
    pickedUp.next.value,
    pickedUp.next.next.value,
  ]);

  let searchValue = start.value === 1 ? length : start.value - 1;
  while (pickedUpValues.has(searchValue)) {
    if (searchValue === 1) {
      searchValue = length; // wrap around
    } else {
      searchValue--;
    }
  }

  return valueToCup.get(searchValue)!;
}

function place3(destination: Cup, pickedUp: Cup) {
  pickedUp.next.next.next = destination.next;
  destination.next = pickedUp;
}

function printCups(start: Cup, length: number) {
  let output = '';
  let current = start;
  for (let i = 0; i < length; i++) {
    output += String(current.value);
    current = current.next;
  }
  console.log(output);
}

function part1(): string {
  const input = fileLines('src/2020/day23/input.txt')[0].split('');

  const valueToUnlinkedCup = new Map<number, UnlinkedCup>();

  const unlinkedCups: UnlinkedCup[] = input.map(char => {
    const cup = {
      value: Number(char),
    };
    valueToUnlinkedCup.set(Number(char), cup);
    return cup;
  });

  for (let i = 0; i < unlinkedCups.length; i++) {
    unlinkedCups[i].next = unlinkedCups[(i + 1) % unlinkedCups.length];
  }

  const cups = unlinkedCups as Cup[];
  const valueToCup = valueToUnlinkedCup as Map<number, Cup>;

  let currentCup = cups[0];
  for (let i = 0; i < 100; i++) {
    // printCups(currentCup, 9);
    const pickedUp = pickUp3(currentCup);
    const destination = findDestination(currentCup, pickedUp, 9, valueToCup);
    place3(destination, pickedUp);
    currentCup = currentCup.next;
  }

  // find cup labeled 1
  let current = currentCup;
  while (current.value !== 1) {
    current = current.next;
  }

  let output = '';
  for (let i = 0; i < 8; i++) {
    current = current.next;
    output += String(current.value);
  }

  return output;
}

function part2(): number {
  const input = fileLines('src/2020/day23/input.txt')[0].split('');

  const valueToUnlinkedCup = new Map<number, UnlinkedCup>();

  const unlinkedCups: UnlinkedCup[] = input.map(char => {
    const cup = {
      value: Number(char),
    };
    valueToUnlinkedCup.set(Number(char), cup);
    return cup;
  });

  for (let i = 10; i <= 1_000_000; i++) {
    const cup = {value: i};
    valueToUnlinkedCup.set(i, cup);
    unlinkedCups.push(cup);
  }

  for (let i = 0; i < unlinkedCups.length; i++) {
    unlinkedCups[i].next = unlinkedCups[(i + 1) % unlinkedCups.length];
  }

  const cups = unlinkedCups as Cup[];
  const valueToCup = valueToUnlinkedCup as Map<number, Cup>;

  let currentCup = cups[0];
  for (let i = 0; i < 10_000_000; i++) {
    // if (i % 100_000 === 0) {
    //   console.log(i);
    // }
    // printCups(currentCup, 1_000_000);
    const pickedUp = pickUp3(currentCup);
    const destination = findDestination(
      currentCup,
      pickedUp,
      1_000_000,
      valueToCup
    );
    place3(destination, pickedUp);
    currentCup = currentCup.next;
  }

  // find cup labeled 1
  let current = currentCup;
  while (current.value !== 1) {
    current = current.next;
  }

  return current.next.value * current.next.next.value;
}

printSolution(part1(), part2());
