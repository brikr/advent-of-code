import {sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {maxWithIndex, ValueWithIndex} from '../../utils/array';

function part1(banks: number[][]): number {
  const joltages: number[] = [];

  for (const bank of banks) {
    // find the highest digit before last
    const battery1 = maxWithIndex(bank.slice(0, -1));
    // and the highest digit after that one
    const battery2 = maxWithIndex(bank.slice(battery1.index + 1));

    const joltage = battery1.value * 10 + battery2.value;
    joltages.push(joltage);
  }

  return sum(joltages);
}

function part2(banks: number[][]): number {
  const joltages: number[] = [];

  for (const bank of banks) {
    const batteries: number[] = [];

    let battery = {
      value: 0,
      index: -1,
    };
    // for each remaining battery, find the highest battery that has room for the rest of the batteries after it
    for (let i = -11; i <= 0; i++) {
      const indexBase = battery.index;
      battery = maxWithIndex(
        bank.slice(battery.index + 1, i !== 0 ? i : undefined)
      );
      battery.index += indexBase + 1; // account for slice
      // console.log(`  battery: ${battery.value} @${battery.index}`);
      batteries.push(battery.value);
    }

    let joltage = 0;
    for (let i = 0; i < 12; i++) {
      joltage += batteries[i] * 10 ** (12 - i - 1);
    }
    // console.log(`bank: ${bank.join('')} joltage: ${joltage}`);
    joltages.push(joltage);
  }

  return sum(joltages);
}

const banks = fileMapSync('src/2025/day03/input.txt', line =>
  line.split('').map(Number)
);
printSolution(part1(banks), part2(banks));
