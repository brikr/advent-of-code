import {fileMap} from '../../utils/file';

async function part1(): Promise<number> {
  let validPasswords = 0;

  await fileMap('src/2020/day02/input.txt', line => {
    // split out the input into the values we care about (regex match should never be null)
    const [_line, min, max, letter, password] = /(\d+)-(\d+) (\w): (\w+)/.exec(
      line
    ) as RegExpExecArray;

    // keep track of the instances of letter in password
    let count = 0;
    for (const char of password.split('')) {
      if (char === letter) {
        count++;
      }
    }

    // if it's within the range, then the password is valid
    if (count >= Number(min) && count <= Number(max)) {
      validPasswords++;
    }
  });

  return validPasswords;
}

function xor(a: boolean, b: boolean) {
  return a ? !b : b;
}

async function part2(): Promise<number> {
  let validPasswords = 0;

  await fileMap('src/2020/day02/input.txt', line => {
    // split out the input into the values we care about (regex match should never be null)
    const [_line, positionA, positionB, letter, password] =
      /(\d+)-(\d+) (\w): (\w+)/.exec(line) as RegExpExecArray;
    const passwordChars = password.split('');

    // if letter is in position A XOR B of password (1-indexed), then the password is valid
    const positionAChar = passwordChars[Number(positionA) - 1];
    const positionBChar = passwordChars[Number(positionB) - 1];
    if (xor(positionAChar === letter, positionBChar === letter)) {
      validPasswords++;
    }
  });

  return validPasswords;
}

async function printSolution() {
  console.log('Part 1:');
  console.log(await part1());

  console.log('Part 2:');
  console.log(await part2());
}

printSolution();
