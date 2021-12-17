import {createReadStream, readFileSync} from 'fs';
import {last} from 'lodash';
import {createInterface} from 'readline';

export async function fileMap<T>(
  filename: string,
  iteratee: (line: string, index: number) => T
): Promise<T[]> {
  const fileStream = createReadStream(filename);
  const rl = createInterface({
    input: fileStream,
  });

  const values = [];
  let idx = 0;

  for await (const line of rl) {
    values.push(iteratee(line, idx));
    idx++;
  }

  return values;
}

export function fileMapSync<T>(
  filename: string,
  iteratee: (line: string, index: number) => T
): T[] {
  const lines = readFileSync(filename, {encoding: 'utf8', flag: 'r'}).split(
    '\n'
  );

  // if the last line is empty, ignore it
  if (!last(lines)) {
    lines.pop();
  }

  return lines.map(iteratee);
}

export function fileLines(filename: string): string[] {
  return fileMapSync(filename, line => line);
}

export function fileAsGrid<T>(
  filename: string,
  castFunction: (input: string) => T,
  delimeter = ''
): T[][] {
  return fileMapSync(filename, line => line.split(delimeter).map(castFunction));
}
