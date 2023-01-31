import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

function fuelRequired(mass: number): number {
  return Math.floor(mass / 3) - 2;
}

function part1(masses: number[]): number {
  let total = 0;
  for (const mass of masses) {
    const fuel = fuelRequired(mass);
    total += fuel;
  }
  return total;
}

function part2(masses: number[]): number {
  let total = 0;
  for (const mass of masses) {
    let totalFuel = 0;
    let fuel = fuelRequired(mass);
    while (fuel > 0) {
      totalFuel += fuel;
      fuel = fuelRequired(fuel);
    }
    total += totalFuel;
  }
  return total;
}

const masses = fileMapSync('src/2019/day01/input.txt', Number);
printSolution(part1(masses), part2(masses));
