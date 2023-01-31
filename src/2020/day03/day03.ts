import {fileMap} from '../../utils/file';

async function part1(right: number, down: number): Promise<number> {
  let treeCount = 0;
  let column = 0;

  await fileMap('src/2020/day03/input.txt', (line, idx) => {
    if (idx % down !== 0) {
      // Keep moving down!
      return;
    }

    const currentSquare = line.charAt(column % line.length);

    if (currentSquare === '#') {
      treeCount++;
    }

    column += right;
  });

  return treeCount;
}

async function printSolution() {
  console.log('Part 1:');
  console.log(await part1(3, 1));

  console.log('Part 2:');
  const treeCounts = [
    await part1(1, 1),
    await part1(3, 1),
    await part1(5, 1),
    await part1(7, 1),
    await part1(1, 2),
  ];
  console.log(treeCounts.reduce((prev, curr) => prev * curr));
}

printSolution();
