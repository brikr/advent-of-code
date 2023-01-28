import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Monkey {
  name: string;
}

interface ConstantMonkey extends Monkey {
  constant: number;
}

type Operation = '+' | '-' | '*' | '/' | '=';

interface OperationMonkey extends Monkey {
  operand1: string;
  operand2: string;
  operation: Operation;
}

type MonkeyMap = Map<string, Monkey>;

function isConstantMonkey(monkey: Monkey): monkey is ConstantMonkey {
  return (monkey as ConstantMonkey).constant !== undefined;
}

function isOperationMonkey(monkey: Monkey): monkey is OperationMonkey {
  return (monkey as OperationMonkey).operation !== undefined;
}

function buildMonkeyMap(monkeys: Monkey[]): MonkeyMap {
  const map = new Map<string, Monkey>();
  for (const monkey of monkeys) {
    map.set(monkey.name, monkey);
  }
  return map;
}

function calculate(monkey: Monkey, map: MonkeyMap): number {
  if (isConstantMonkey(monkey)) {
    return monkey.constant;
  } else if (isOperationMonkey(monkey)) {
    const operand1 = calculate(map.get(monkey.operand1)!, map);
    const operand2 = calculate(map.get(monkey.operand2)!, map);

    switch (monkey.operation) {
      case '+':
        return operand1 + operand2;
      case '-':
        return operand1 - operand2;
      case '*':
        return operand1 * operand2;
      case '/':
        return operand1 / operand2;
    }
  }
  throw 'typeless monkey';
}

function part1(monkeys: Monkey[]): number {
  const map = buildMonkeyMap(monkeys);
  return calculate(map.get('root')!, map);
}

function fillInNaN(
  monkey: Monkey,
  map: MonkeyMap,
  resultWanted: number
): number {
  if (isConstantMonkey(monkey)) {
    return resultWanted;
  } else if (isOperationMonkey(monkey)) {
    const operand1 = calculate(map.get(monkey.operand1)!, map);
    const operand2 = calculate(map.get(monkey.operand2)!, map);

    switch (monkey.operation) {
      case '+':
        if (isNaN(operand1)) {
          // x + o2 = rw
          // x = rw - o2
          return resultWanted - operand2;
        } else {
          // o1 + x = rw
          // x = rw - o1
          return resultWanted - operand1;
        }
      case '-':
        if (isNaN(operand1)) {
          // x - o2 = rw
          // x = rw + o2
          return resultWanted + operand2;
        } else {
          // o1 - x = rw
          // o1 = rw + x
          // x = o1 - rw
          return operand1 - resultWanted;
        }
      case '*':
        if (isNaN(operand1)) {
          // x * o2 = rw
          // x = rw / o2
          return resultWanted / operand2;
        } else {
          // o1 * x = rw
          // x = rw / o1
          return resultWanted / operand1;
        }
      case '/':
        if (isNaN(operand1)) {
          // x / o2 = rw
          // x = rw * o2
          return resultWanted * operand2;
        } else {
          // o1 / x = rw
          // o1 = rw * x
          // x = o1 / rw
          return operand1 / resultWanted;
        }
      case '=':
        if (isNaN(operand1)) {
          return operand2;
        } else {
          return operand1;
        }
    }
  }
  throw 'typeless monkey';
}

function part2(monkeys: Monkey[]): number {
  const map = buildMonkeyMap(monkeys);
  const root = map.get('root')!;
  if (isOperationMonkey(root)) {
    root.operation = '=';
  }
  const human = map.get('humn')!;
  if (isConstantMonkey(human)) {
    human.constant = NaN;
  }

  let curr = root;
  let valueNeeded = 0;
  while (isOperationMonkey(curr)) {
    valueNeeded = fillInNaN(curr, map, valueNeeded);
    // console.log('value needed for', curr.name, ':', valueNeeded);
    // TODO: should cache calculations
    const operand1 = calculate(map.get(curr.operand1)!, map);
    if (isNaN(operand1)) {
      curr = map.get(curr.operand1)!;
    } else {
      curr = map.get(curr.operand2)!;
    }
  }

  return valueNeeded;
}

const monkeys = fileMapSync('src/2022/day21/input.txt', line => {
  const constantMatch = line.match(/^(.{4}): (\d+)$/);
  if (constantMatch) {
    const name = constantMatch[1];
    const constant = Number(constantMatch[2]);
    return {
      name,
      constant,
    };
  } else {
    const [_, name, operand1, operation, operand2] = line.match(
      /^(.{4}): (.{4}) (.) (.{4})$/
    )!;
    return {
      name,
      operand1,
      operation,
      operand2,
    };
  }
});
printSolution(part1(monkeys), part2(monkeys));
