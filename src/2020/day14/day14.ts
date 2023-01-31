import {sum} from 'lodash';
import {fileLines} from '../../utils/file';

function toBinary(n: number): string {
  let binary = '';

  while (Math.ceil(n / 2) > 0) {
    binary = (n % 2) + binary;
    n = Math.floor(n / 2);
  }

  return binary;
}

function replaceAt(str: string, index: number, replacement: string) {
  return (
    str.substr(0, index) + replacement + str.substr(index + replacement.length)
  );
}

function write(
  memory: {[address: string]: number},
  address: number,
  value: number,
  mask: string
) {
  let binaryValue = toBinary(value).padStart(36, '0');

  for (let i = 0; i < 36; i++) {
    const maskBit = mask.charAt(i);
    if (maskBit !== 'X') {
      binaryValue = replaceAt(binaryValue, i, maskBit);
    }
  }

  const maskedValue = parseInt(binaryValue, 2);

  memory[address] = maskedValue;
}

function part1(): number {
  const lines = fileLines('src/2020/day14/input.txt');
  lines.pop();

  const memory: {[address: number]: number} = {};
  let mask = '';

  for (const line of lines) {
    if (line.startsWith('mask')) {
      // set mask
      const [_, newMask] = line.split(' = ');
      mask = newMask;
    } else {
      // set mem
      const match = line.match(/mem\[(\d+)\] = (\d+)/) as RegExpMatchArray;
      const address = Number(match[1]);
      const value = Number(match[2]);

      write(memory, address, value, mask);
    }
  }

  return sum(Object.values(memory));
}

function getAllFloatingAddresses(address: number, mask: string): number[] {
  let binaryAddress = toBinary(address).padStart(36, '0');

  for (let i = 0; i < 36; i++) {
    const maskBit = mask.charAt(i);
    if (maskBit !== '0') {
      binaryAddress = replaceAt(binaryAddress, i, maskBit);
    }
  }

  const stack = [binaryAddress];
  const possibleAddresses: number[] = [];
  while (stack.length > 0) {
    const next = stack.pop() as string;
    const idx = next.indexOf('X');
    if (idx !== -1) {
      // still an X in the floater, push both its states into stack
      const toZero = replaceAt(next, idx, '0');
      const toOne = replaceAt(next, idx, '1');
      stack.push(toZero);
      stack.push(toOne);
    } else {
      // no more X's, it's a possible address
      possibleAddresses.push(parseInt(next, 2));
    }
  }

  return possibleAddresses;
}

function part2(): number {
  const lines = fileLines('src/2020/day14/input.txt');
  lines.pop();

  const memory: {[address: number]: number} = {};
  let mask = '';

  for (const line of lines) {
    if (line.startsWith('mask')) {
      // set mask
      const [_, newMask] = line.split(' = ');
      mask = newMask;
    } else {
      // set mem
      const match = line.match(/mem\[(\d+)\] = (\d+)/) as RegExpMatchArray;
      const address = Number(match[1]);
      const value = Number(match[2]);

      const floatingAddresses = getAllFloatingAddresses(address, mask);
      for (const addr of floatingAddresses) {
        memory[addr] = value;
      }
    }
  }

  return sum(Object.values(memory));
}

function printSolution() {
  console.log('Part 1:');
  console.log(part1());
  console.log('Part 2:');
  console.log(part2());
}

printSolution();
