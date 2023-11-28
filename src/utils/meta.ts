import axios from 'axios';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {unescape} from 'lodash';
import {environment} from '../environment';
import {dayToString} from './dayString';

const EXAMPLE_REGEX = /for example.*\n.*<code>([^<]+)<\/code>/i;

// Fetches the input from AOC servers and saves it to dayXX/input.txt
// Also attempts to parse sample input from the problem page itself and saves to dayXX/input-test.txt
// If the input file already exists, no download is performed unless force is true.
export async function fetchInput(year: number, day: number, force = false, cpp = false) {
  // Check if the input file already exists
  const dayString = dayToString(day);
  const baseDir = cpp ? 'src/cpp' : 'src';
  const inputAlreadyExists = existsSync(
    `${baseDir}/${year}/day${dayString}/input.txt`
  );
  if (inputAlreadyExists && !force) {
    console.debug(
      `Input for year ${year} day ${day} already exists on disk. Not downloading.`
    );
    return;
  }

  // Download the input file
  console.debug(`Downloading input for year ${year} day ${day}.`);
  const response = await axios.get(
    `https://adventofcode.com/${year}/day/${day}/input`,
    {
      headers: {
        cookie: `session=${environment.session}`,
      },
      responseType: 'text',
      transformResponse: data => data,
    }
  );

  writeFileSync(`${baseDir}/${year}/day${dayString}/input.txt`, response.data);

  console.debug(`Parsing puzzle page for year ${year} day ${day}.`);
  // Try to find a sample input from the problem description
  const puzzlePage = await axios.get<string>(
    `https://adventofcode.com/${year}/day/${day}`,
    {responseType: 'document'}
  );

  // console.log(puzzlePage.data);
  const match = puzzlePage.data.match(EXAMPLE_REGEX)?.[1];

  if (match) {
    console.debug(
      `Found a probable sample block for year ${year} day ${day}. Saving to input-test.txt.`
    );
    writeFileSync(
      `${baseDir}/${year}/day${dayString}/input-test.txt`,
      unescape(match)
    );
  } else {
    console.debug(
      `Couldn't find a good sample block for year ${year} day ${day}. Making an empty input-test.txt for you.`
    );
    writeFileSync(`${baseDir}/${year}/day${dayString}/input-test.txt`, '');
  }
}

// Make the source file for a given day if it doesn't exist
export function generateDaySource(year: number, day: number, cpp = false) {
  const dayString = dayToString(day);
  const ext = cpp ? 'cpp' : 'ts';
  const baseDir = cpp ? 'src/cpp' : 'src';

  const sourceExists = existsSync(
    `${baseDir}/${year}/day${dayString}/day${dayString}.${ext}`
  );

  if (sourceExists) {
    console.debug(
      `Source file for year ${year} day ${day} exists. Not creating anything.`
    );
  } else {
    console.debug(
      `No source file for year ${year} day ${day} exists. Creating from template.`
    );

    const template = readFileSync(`src/day-template/day-template.${ext}`)
      .toString()
      .replace('YEAR_STRING', String(year))
      .replace('DAY_STRING', dayString);

    mkdirSync(`${baseDir}/${year}/day${dayString}`);
    writeFileSync(`${baseDir}/${year}/day${dayString}/day${dayString}.${ext}`, template);
  }
}
