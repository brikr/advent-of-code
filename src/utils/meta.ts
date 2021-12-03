import axios from 'axios';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {environment} from '../environment';
import {dayToString} from './dayString';

const EXAMPLE_REGEX = /for example.*\n.*<code>([^<]+)<\/code>/i;

// Fetches the input from AOC servers and saves it to dayXX/input.txt
// Also attempts to parse sample input from the problem page itself and saves to dayXX/input-test.txt
// If the input file already exists, no download is performed unless force is true.
export async function fetchInput(day: number, force = false) {
  // Check if the input file already exists
  const dayString = dayToString(day);
  const inputAlreadyExists = existsSync(`src/day${dayString}/input.txt`);
  if (inputAlreadyExists && !force) {
    console.debug(
      `Input for day ${day} already exists on disk. Not downloading.`
    );
    return;
  }

  // Download the input file
  console.debug(`Downloading input for day ${day}.`);
  const response = await axios.get(
    `https://adventofcode.com/2021/day/${day}/input`,
    {
      headers: {
        cookie: `session=${environment.session}`,
      },
      responseType: 'text',
    }
  );

  writeFileSync(`src/day${dayString}/input.txt`, response.data);

  console.debug(`Parsing puzzle page for day ${day}.`);
  // Try to find a sample input from the problem description
  const puzzlePage = await axios.get<string>(
    `https://adventofcode.com/2021/day/${day}`,
    {responseType: 'document'}
  );

  // console.log(puzzlePage.data);
  const match = puzzlePage.data.match(EXAMPLE_REGEX)?.[1];

  if (match) {
    console.debug(
      `Found a probable sample block for day ${day}. Saving to input-test.txt.`
    );
    writeFileSync(`src/day${dayString}/input-test.txt`, match);
  } else {
    console.debug(`Couldn't find a good sample block for day ${day}.`);
  }
}

// Make the source file for a given day if it doesn't exist
export function generateDaySource(day: number) {
  const dayString = dayToString(day);

  const sourceExists = existsSync(`src/day${dayString}/day${dayString}.ts`);

  if (sourceExists) {
    console.debug(`Source file for day ${day} exists. Not creating anything.`);
  } else {
    console.debug(
      `No source file for day ${day} exists. Creating from template.`
    );

    const template = readFileSync('src/day-template/day-template.ts')
      .toString()
      .replace('DAY_STRING', dayString);
    mkdirSync(`src/day${dayString}`);
    writeFileSync(`src/day${dayString}/day${dayString}.ts`, template);
  }
}
