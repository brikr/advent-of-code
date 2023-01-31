import {fileMap} from '../../utils/file';

interface Passport {
  byr?: string;
  iyr?: string;
  eyr?: string;
  hgt?: string;
  hcl?: string;
  ecl?: string;
  pid?: string;
  cid?: string;
}

function isValidPassportPart1(passport: Passport): boolean {
  return (
    passport.byr !== undefined &&
    passport.iyr !== undefined &&
    passport.eyr !== undefined &&
    passport.hgt !== undefined &&
    passport.hcl !== undefined &&
    passport.ecl !== undefined &&
    passport.pid !== undefined
  );
}

function isValidPassportPart2(passport: Passport): boolean {
  // Check for required fields
  if (
    passport.byr === undefined ||
    passport.iyr === undefined ||
    passport.eyr === undefined ||
    passport.hgt === undefined ||
    passport.hcl === undefined ||
    passport.ecl === undefined ||
    passport.pid === undefined
  ) {
    return false;
  }

  // byr
  const byr = Number(passport.byr);
  if (byr < 1920 || byr > 2002) {
    return false;
  }

  // iyr
  const iyr = Number(passport.iyr);
  if (iyr < 2010 || iyr > 2020) {
    return false;
  }

  // eyr
  const eyr = Number(passport.eyr);
  if (eyr < 2020 || eyr > 2030) {
    return false;
  }

  // hgt
  const hgtMatch = passport.hgt.match(/(\d+)(cm|in)/);
  if (hgtMatch) {
    const hgtAmt = Number(hgtMatch[1]);
    const hgtUnit = hgtMatch[2];

    if (hgtUnit === 'in') {
      if (hgtAmt < 59 || hgtAmt > 76) {
        return false;
      }
    } else {
      if (hgtAmt < 150 || hgtAmt > 193) {
        return false;
      }
    }
  } else {
    return false;
  }

  // hcl
  const hclMatch = passport.hcl.match(/^#[0-9a-f]{6}$/);
  if (hclMatch === null) {
    return false;
  }

  // ecl
  const {ecl} = passport;
  if (!['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].includes(ecl)) {
    return false;
  }

  // pid
  const pidMatch = passport.pid.match(/^[0-9]{9}$/);
  if (pidMatch === null) {
    return false;
  }

  // if we made it this far, it's valid!
  return true;
}

async function validatePassports(part1: boolean): Promise<number> {
  let validPassports = 0;

  let currentPassport: Passport = {};
  await fileMap('src/2020/day04/input.txt', line => {
    if (line === '') {
      // empty line means we just finished reading in a passport. check its validity and clear it
      if (part1) {
        if (isValidPassportPart1(currentPassport)) {
          validPassports++;
        }
      } else {
        if (isValidPassportPart2(currentPassport)) {
          validPassports++;
        }
      }
      currentPassport = {};
      return;
    }

    // otherwise, add this line's data to our current passport
    for (const field of line.split(' ')) {
      const [key, value] = field.split(':') as [keyof Passport, string];
      currentPassport[key] = value;
    }
  });

  return validPassports;
}

async function printSolution() {
  console.log('Part 1:');
  console.log(await validatePassports(true));
  console.log('Part 2:');
  console.log(await validatePassports(false));
}

printSolution();
