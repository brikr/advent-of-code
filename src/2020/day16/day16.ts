import {sum} from 'lodash';
import {fileLines} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

interface FieldRange {
  low: number;
  high: number;
}

function part1(): number {
  const lines = fileLines('src/2020/day16/input.txt');
  lines.pop();

  const fields = new MapWithDefault<string, FieldRange[]>([]);
  const nearbyTickets: number[][] = [];
  const invalidValues: number[] = [];

  let section = 0;

  for (const line of lines) {
    if (line === '') {
      section++;
      continue;
    }
    if (section === 0) {
      // fields
      const fieldMatch = line.match(
        /(\w+): (\d+)-(\d+) or (\d+)-(\d+)/
      ) as RegExpMatchArray;
      const fieldName = fieldMatch[1];
      const rangeALow = Number(fieldMatch[2]);
      const rangeAHigh = Number(fieldMatch[3]);
      const rangeBLow = Number(fieldMatch[4]);
      const rangeBHigh = Number(fieldMatch[5]);

      fields.set(fieldName, [
        {
          low: rangeALow,
          high: rangeAHigh,
        },
        {
          low: rangeBLow,
          high: rangeBHigh,
        },
      ]);
    } else if (section === 2) {
      // nearby tickets
      if (line !== 'nearby tickets:') {
        nearbyTickets.push(line.split(',').map(Number));
      }
    }
  }

  for (const ticket of nearbyTickets) {
    for (const number of ticket) {
      let isValid = false;
      allFields: for (const field of fields.values()) {
        for (const range of field) {
          if (number >= range.low && number <= range.high) {
            isValid = true;
            break allFields;
          }
        }
      }
      if (!isValid) {
        invalidValues.push(number);
      }
    }
  }

  return sum(invalidValues);
}

function part2(): number {
  const lines = fileLines('src/2020/day16/input.txt');
  lines.pop();

  const fields = new MapWithDefault<string, FieldRange[]>([]);
  let yourTicket: number[] = [];
  const nearbyTickets: number[][] = [];
  const validTickets: number[][] = [];

  let section = 0;

  for (const line of lines) {
    if (line === '') {
      section++;
      continue;
    }
    if (section === 0) {
      // fields
      const fieldMatch = line.match(
        /([\w\W]+): (\d+)-(\d+) or (\d+)-(\d+)/
      ) as RegExpMatchArray;
      const fieldName = fieldMatch[1];
      const rangeALow = Number(fieldMatch[2]);
      const rangeAHigh = Number(fieldMatch[3]);
      const rangeBLow = Number(fieldMatch[4]);
      const rangeBHigh = Number(fieldMatch[5]);

      fields.set(fieldName, [
        {
          low: rangeALow,
          high: rangeAHigh,
        },
        {
          low: rangeBLow,
          high: rangeBHigh,
        },
      ]);
    } else if (section === 1) {
      // your ticket
      if (line !== 'your ticket:') {
        yourTicket = line.split(',').map(Number);
      }
    } else if (section === 2) {
      // nearby tickets
      if (line !== 'nearby tickets:') {
        nearbyTickets.push(line.split(',').map(Number));
      }
    }
  }

  for (const ticket of nearbyTickets) {
    let isValid = true;
    for (const number of ticket) {
      let isValidNumber = false;
      allFields: for (const field of fields.values()) {
        for (const range of field) {
          if (number >= range.low && number <= range.high) {
            isValidNumber = true;
            break allFields;
          }
        }
      }
      if (!isValidNumber) {
        isValid = false;
        break;
      }
    }
    if (isValid) {
      validTickets.push(ticket);
    }
  }

  let fieldCount = 0;
  const fieldsInOrder: string[] = [];

  // loop through all fields and find the field that is only valid in one place and put it in our fieldsInOrder array
  // keep doing this until the array is full
  // all tickets are the same length; just going through each index for all valid tickets
  while (fieldCount < yourTicket.length) {
    for (let i = 0; i < yourTicket.length; i++) {
      const validFields = new Set(fields.keys());

      for (const fieldName of fieldsInOrder) {
        validFields.delete(fieldName);
      }

      for (const ticket of validTickets) {
        const number = ticket[i];
        for (const fieldName of validFields) {
          let isValidNumber = false;
          for (const range of fields.get(fieldName)) {
            if (number >= range.low && number <= range.high) {
              isValidNumber = true;
            }
          }
          if (!isValidNumber) {
            validFields.delete(fieldName);
          }
        }
      }

      const possibleFields = Array.from(validFields.values());
      if (possibleFields.length === 1) {
        fieldsInOrder[i] = possibleFields[0];
        fieldCount++;
        console.log(fieldsInOrder);
      }
    }
  }

  let value = 1;
  for (let i = 0; i < fieldsInOrder.length; i++) {
    if (fieldsInOrder[i].startsWith('departure')) {
      value *= yourTicket[i];
    }
  }

  return value;
}

printSolution(part1(), part2());
