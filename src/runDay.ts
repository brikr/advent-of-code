import {last} from 'lodash';
import {performance} from 'perf_hooks';
import {exit} from 'process';
import {dayToString} from './utils/dayString';
import {fetchInput, generateDaySource} from './utils/meta';

async function main() {
  // Parse day from argv
  const day = Number(last(process.argv));

  if (isNaN(day)) {
    console.error('Usage: npm run day <day>\n e.g.: npm run day 2');
    exit();
  }

  // Make the source file for that day if it doesn't exist
  generateDaySource(day);

  // Fetch the input for the given day
  try {
    await fetchInput(day);
  } catch (e) {
    // Assume any error here is due to 404 from puzzle not being live yet
    console.error(`Day ${day} is not live yet!`);
    return;
  }

  // require() the day's source file. Since we read the file and printSolution at the top-level, this will execute that
  // code
  const dayString = dayToString(day);
  const startTime = performance.now();
  require(`./day${dayString}/day${dayString}`);
  const endTime = performance.now();
  console.log(`ran in ${Math.floor(endTime - startTime) / 1000}s`);
}

main();
