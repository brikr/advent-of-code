import {performance} from 'perf_hooks';
import {exit} from 'process';
import {dayToString} from './utils/dayString';
import {fetchInput, generateDaySource} from './utils/meta';

async function main() {
  // Parse day from argv
  const [year, day] = process.argv.slice(-2).map(Number);

  if (isNaN(day) || isNaN(year)) {
    console.error('Usage: npm run day-cpp <year> <day>\n e.g.: npm run day-cpp 2023 2');
    exit();
  }

  // Make the source file for that day if it doesn't exist
  generateDaySource(year, day, true);

  // Fetch the input for the given day
  try {
    await fetchInput(year, day, false, true);
  } catch (e) {
    // Assume any error here is due to 404 from puzzle not being live yet
    console.error(`Year ${year} day ${day} is not live yet!`);
    return;
  }

  console.log(`Year ${year} day ${day} is setup.`);
}

main();
