import {cloneDeep, times} from 'lodash';
import {dequeue} from '../../utils/array';
import {fileLines} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Item {
  worry: number;
}

interface Operation {
  symbol: '+' | '*';
  operand1: number | 'old';
  operand2: number | 'old';
}

interface Test {
  divisibleBy: number;
  true: number;
  false: number;
}

interface Monkey {
  items: Item[];
  operation: Operation;
  test: Test;
  itemsInspected: number;
}

const FRESH_MONKEY: Monkey = {
  items: [],
  operation: {
    symbol: '+',
    operand1: 0,
    operand2: 0,
  },
  test: {
    divisibleBy: 0,
    true: 0,
    false: 0,
  },
  itemsInspected: 0,
};

function performOperation(op: Operation, old: number): number {
  const o1 = op.operand1 === 'old' ? old : op.operand1;
  const o2 = op.operand2 === 'old' ? old : op.operand2;
  if (op.symbol === '+') {
    return o1 + o2;
  } else {
    return o1 * o2;
  }
}

// monkeys is modified in place
function performRound(monkeys: Monkey[], modulo: number, divideByThree = true) {
  for (const [idx, monkey] of monkeys.entries()) {
    // console.log(`Monkey ${idx}:`);
    monkey.itemsInspected += monkey.items.length;

    while (monkey.items.length > 0) {
      const item = dequeue(monkey.items)!;
      // Worry math
      // console.log(`  Monkey inspects an item with worry level ${item.worry}.`);
      let newWorry = performOperation(monkey.operation, item.worry) % modulo;
      // console.log(
      //   `    Worry level is ${monkey.operation.symbol} by ${monkey.operation.operand2} to ${newWorry}.`
      // );
      if (divideByThree) {
        newWorry /= 3;
        newWorry = Math.floor(newWorry);
        // console.log(
        //   `    Monkey gets bored with item. Worry level is divided by 3 to ${newWorry}.`
        // );
      }

      // Perform test
      if (newWorry % monkey.test.divisibleBy === 0) {
        // console.log(
        //   `    Current worry level is divisible by ${monkey.test.divisibleBy}.`
        // );
        // console.log(
        //   `    Item with worry level ${newWorry} is thrown to monkey ${monkey.test.true}.`
        // );
        monkeys[monkey.test.true].items.push({worry: newWorry});
      } else {
        // console.log(
        //   `    Current worry level is not divisible by ${monkey.test.divisibleBy}.`
        // );
        // console.log(
        //   `    Item with worry level ${newWorry} is thrown to monkey ${monkey.test.false}.`
        // );
        monkeys[monkey.test.false].items.push({worry: newWorry});
      }
    }
  }
}

function part1(monkeys: Monkey[]): number {
  const modulo = monkeys
    .map(m => m.test.divisibleBy)
    .reduce((acc, cur) => acc * cur, 1);

  times(20, () => {
    performRound(monkeys, modulo);
  });
  const sortedItemsInspected = monkeys
    .map(m => m.itemsInspected)
    .sort((a, b) => b - a);
  return sortedItemsInspected[0] * sortedItemsInspected[1];
}

function part2(monkeys: Monkey[]): number {
  const modulo = monkeys
    .map(m => m.test.divisibleBy)
    .reduce((acc, cur) => acc * cur, 1);

  times(10000, () => {
    performRound(monkeys, modulo, false);
  });
  const sortedItemsInspected = monkeys
    .map(m => m.itemsInspected)
    .sort((a, b) => b - a);
  return sortedItemsInspected[0] * sortedItemsInspected[1];
}

const lines = fileLines('src/2022/day11/input.txt');

const monkeys: Monkey[] = [];
let currentMonkey: Monkey = cloneDeep(FRESH_MONKEY);
for (const line of lines) {
  if (line.startsWith('Monkey')) {
    // nop
  } else if (line.length === 0) {
    // done loading currentMonkey
    monkeys.push(currentMonkey);
    currentMonkey = cloneDeep(FRESH_MONKEY);
  } else if (line.startsWith('  Starting items:')) {
    currentMonkey.items = line.match(/(\d+)/g)!.map(n => ({
      worry: Number(n),
    }));
  } else if (line.startsWith('  Operation:')) {
    const [o1Str, symbolStr, o2Str] = line.match(/(old)|(\d+)|([+*])/g)!;
    let operand1: number | 'old';
    let operand2: number | 'old';
    if (o1Str === 'old') {
      operand1 = o1Str;
    } else {
      operand1 = Number(o1Str);
    }
    if (o2Str === 'old') {
      operand2 = o2Str;
    } else {
      operand2 = Number(o2Str);
    }
    currentMonkey.operation = {
      symbol: symbolStr as '+' | '*',
      operand1,
      operand2,
    };
  } else if (line.startsWith('  Test:')) {
    currentMonkey.test.divisibleBy = Number(line.match(/(\d+)/g)![0]);
  } else if (line.startsWith('    If true:')) {
    currentMonkey.test.true = Number(line.match(/(\d+)/g)![0]);
  } else if (line.startsWith('    If false:')) {
    currentMonkey.test.false = Number(line.match(/(\d+)/g)![0]);
  }
}
monkeys.push(currentMonkey);

// console.log(monkeys);

printSolution(part1(cloneDeep(monkeys)), part2(cloneDeep(monkeys)));
