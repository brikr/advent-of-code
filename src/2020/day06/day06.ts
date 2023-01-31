import {fileMap} from '../../utils/file';

async function part1(): Promise<number> {
  let total = 0;

  // simply use a set to keep track of yesses
  let currentGroup = new Set<string>();
  await fileMap('src/2020/day06/input.txt', line => {
    if (line === '') {
      total += currentGroup.size;
      currentGroup = new Set<string>();
    } else {
      for (const char of line.split('')) {
        currentGroup.add(char);
      }
    }
  });
  total += currentGroup.size;

  return total;
}

async function part2(): Promise<number> {
  let total = 0;

  // similar to part 1, except that after the first survey in a group is recorded, we update the group answer to be the
  // intersection of itself and the most recent survey
  let currentGroup = new Set<string>();
  let firstInGroup = true;
  await fileMap('src/2020/day06/input.txt', line => {
    if (line === '') {
      total += currentGroup.size;
      currentGroup = new Set<string>();
      firstInGroup = true;
    } else {
      const currentSurvey = new Set<string>();
      for (const char of line.split('')) {
        currentSurvey.add(char);
      }
      if (firstInGroup) {
        for (const char of currentSurvey) {
          currentGroup.add(char);
        }
      } else {
        for (const char of currentGroup) {
          if (!currentSurvey.has(char)) {
            currentGroup.delete(char);
          }
        }
      }
      firstInGroup = false;
    }
  });
  total += currentGroup.size;

  return total;
}

async function printSolution() {
  console.log('Part 1:');
  console.log(await part1());
  console.log('Part 2:');
  console.log(await part2());
}

printSolution();
