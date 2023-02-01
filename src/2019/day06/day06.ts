import {fileMapSync} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

function part1(orbits: string[][]): number {
  // key: planet, value: planet it orbits
  const orbitMap = new Map<string, string>();
  for (const [parent, planet] of orbits) {
    orbitMap.set(planet, parent);
  }
  // console.log(orbitMap);

  let total = 0;
  for (const planet of orbitMap.keys()) {
    let orbits = 0;
    let curr = planet;
    while (curr !== 'COM') {
      curr = orbitMap.get(curr)!;
      orbits++;
    }
    // console.log(planet, 'has', orbits, 'orbits');
    total += orbits;
  }
  return total;
}

function part2(orbits: string[][]): number {
  // key: planet, value: planet it orbits
  const orbitMap = new Map<string, string>();
  for (const [parent, planet] of orbits) {
    orbitMap.set(planet, parent);
  }

  // key: planet, value: list of parents in order up to COM
  const parentListMap = {
    YOU: new Array<string>(),
    SAN: new Array<string>(),
  };
  for (const planet of ['YOU', 'SAN'] as const) {
    const parentList: string[] = [];
    let curr: string | undefined = planet;
    while (curr) {
      curr = orbitMap.get(curr);
      if (curr) {
        parentList.push(curr);
      }
    }
    parentListMap[planet] = parentList;
  }
  // console.log(parentListMap);

  for (const [youDistance, planet] of parentListMap.YOU.entries()) {
    const sharedParentSanDistance = parentListMap.SAN.findIndex(
      p => p === planet
    );

    if (sharedParentSanDistance !== -1) {
      // found!
      return youDistance + sharedParentSanDistance;
    }
  }

  // woops
  return 0;
}

const orbits = fileMapSync('src/2019/day06/input.txt', line => line.split(')'));
printSolution(part1(orbits), part2(orbits));
