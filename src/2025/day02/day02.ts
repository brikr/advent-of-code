import {sum} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {Range} from '../../utils/range';

function isValidP1(id: number): boolean {
  const str = String(id);
  const len = str.length;
  if (len % 2 !== 0) {
    // can't repeat if ur odd length
    return true;
  }

  const firstHalf = str.substring(0, len / 2);
  const secondHalf = str.substring(len / 2);

  // valid if halves don't match
  return firstHalf !== secondHalf;
}

function part1(ranges: Range[]): number {
  const invalids: number[] = [];
  for (const range of ranges) {
    for (let id = range.min; id <= range.max; id++) {
      if (!isValidP1(id)) {
        invalids.push(id);
      }
    }
  }
  // console.log(invalids);
  return sum(invalids);
}

function isValidP2(id: number): boolean {
  const str = String(id);
  const len = str.length;

  // find all multiples of length
  const segmentLens: number[] = [];
  for (let i = 1; i <= len / 2; i++) {
    if (len % i === 0) {
      segmentLens.push(i);
    }
  }

  // for each multiple, split into segments of that size
  for (const segmentLen of segmentLens) {
    const segments: string[] = [];
    for (let start = 0; start < len; start += segmentLen) {
      segments.push(str.substring(start, start + segmentLen));
    }

    // if all segments are equal, return false
    if (segments.every(seg => seg === segments[0])) {
      return false;
    }
  }

  // no invalidities found, id is valid
  return true;
}

function part2(ranges: Range[]): number {
  const invalids: number[] = [];
  for (const range of ranges) {
    for (let id = range.min; id <= range.max; id++) {
      if (!isValidP2(id)) {
        invalids.push(id);
      }
    }
  }
  // console.log(invalids);
  return sum(invalids);
}

const lines = fileMapSync('src/2025/day02/input.txt', line => line);
const ranges: Range[] = lines[0].split(',').map(rangeStr => {
  const [_, minStr, maxStr] = rangeStr.match(/(\d+)-(\d+)/)!;
  return {
    min: Number(minStr),
    max: Number(maxStr),
  };
});
printSolution(part1(ranges), part2(ranges));
