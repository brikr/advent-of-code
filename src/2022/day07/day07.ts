import {repeat} from 'lodash';
import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface File {
  size: number;
  name: string;
}

interface Directory {
  name: string;
  parent?: Directory;
  children: Map<string, Directory>;
  files: File[];
}

function printDirectory(dir: Directory, indentCount?: number) {
  if (indentCount === undefined) {
    // base case
    console.log(`${dir.name} (dir)`);
    indentCount = 2;
  }

  const indentation = repeat(' ', indentCount);

  for (const file of dir.files) {
    console.log(`${indentation}${file.name} (file, size=${file.size})`);
  }
  for (const [name, childDir] of dir.children) {
    console.log(`${indentation}${name} (dir)`);
    printDirectory(childDir, indentCount + 2);
  }
}

// a unique id for a directory
function getUID(dir: Directory): string {
  let cwd: Directory | undefined = dir;
  let uid = '';
  while (cwd) {
    uid += `${cwd.name}/`;
    cwd = cwd.parent;
  }
  return uid;
}

function getTotalSize(
  dir: Directory,
  map?: Map<string, number>
): [number, Map<string, number>] {
  map ||= new Map<string, number>();

  let total = 0;

  for (const childDir of dir.children.values()) {
    total += getTotalSize(childDir, map)[0];
  }
  for (const file of dir.files) {
    total += file.size;
  }

  map.set(getUID(dir), total);
  return [total, map];
}

function newDirectory(name: string, parent?: Directory): Directory {
  return {
    name,
    parent,
    children: new Map<string, Directory>(),
    files: [],
  };
}

function part1(root: Directory): number {
  const map = getTotalSize(root)[1];

  let total = 0;

  for (const size of map.values()) {
    if (size <= 100000) {
      total += size;
    }
  }

  return total;
}

function part2(root: Directory): number {
  const [total, map] = getTotalSize(root);

  const currentFreeSpace = 70000000 - total;
  const amountToFree = 30000000 - currentFreeSpace;

  let min = total;

  for (const size of map.values()) {
    if (size < min && size > amountToFree) {
      min = size;
    }
  }

  return min;
}

const lines = fileLines('src/2022/day07/input.txt');

const root: Directory = newDirectory('/');

let cwd = root;

let pc = 0;
const readingLs = false;
while (pc < lines.length) {
  const line = lines[pc];
  // console.log(`${cwd.name}`, line);
  if (line.startsWith('$ cd')) {
    const newCwdName = line.substring(5);
    if (newCwdName === '/') {
      // special case, go to root
      cwd = root;
    } else if (newCwdName === '..') {
      // special case, go up
      if (cwd.parent) {
        cwd = cwd.parent;
      }
    } else if (cwd.children.has(newCwdName)) {
      // we already know about this dir
      // console.log(`  we've seen ${newCwdName} before, changing cwd`);
      cwd = cwd.children.get(newCwdName)!;
    } else {
      // haven't seen this dir before
      // console.log(
      //   `  we haven't seen ${newCwdName} before, creating it with parent ${cwd.name}`
      // );
      const newCwd = newDirectory(newCwdName, cwd);
      cwd.children.set(newCwdName, newCwd);
      cwd = newCwd;
    }
  } else if (line.startsWith('$ ls')) {
    // nop, we read any unknown lines as ls entries anyway
  } else {
    // append info to cwd
    const [sizeOrDir, name] = line.split(' ');
    if (line.startsWith('dir') && !cwd.children.has(name)) {
      // we didn't know about this dir, just add it to this one for posterity
      cwd.children.set(name, newDirectory(name, cwd));
    } else {
      // file info, add to files
      const file = {
        size: Number(sizeOrDir),
        name,
      };
      cwd.files.push(file);
    }
  }
  pc++;
}

// printDirectory(root);

printSolution(part1(root), part2(root));
