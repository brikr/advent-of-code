import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {uuid} from '../../utils/uuid';

interface Transition {
  input: string;
  requiredTop: string;
  newTop: string;
  to: State;
}

function State(state?: Partial<State>): State {
  return {
    id: uuid(),
    transitions: [],
    match: false,
    loop: false,
    ...state,
  };
}

interface State {
  id: string;
  transitions: Transition[];
  match: boolean;
  loop: boolean;
}

interface PDA {
  current: State;
  stack: string[];
  transitions: number;
}

// quick and dirty hash of pda
// cares about stack and current state
function pdaHashCode(pda: PDA): string {
  return `${pda.stack.join(',')},${pda.current.id}`;
}

class PDASet {
  map = new Map<string, PDA>();

  [Symbol.iterator]() {
    return this.map.values();
  }

  add(pda: PDA) {
    this.map.set(pdaHashCode(pda), pda);
  }

  addAll(pdas: Iterable<PDA>) {
    for (const pda of pdas) {
      this.add(pda);
    }
  }

  has(pda: PDA): boolean {
    return Boolean(this.map.get(pdaHashCode(pda)));
  }

  hasAll(pdas: Iterable<PDA>) {
    for (const pda of pdas) {
      if (!this.has(pda)) {
        return false;
      }
    }

    return true;
  }
}

function createPDA(rules: Map<string, string[]>): PDA {
  const pda: PDA = {
    current: State({loop: true}),
    stack: [],
    transitions: 0,
  };

  // base of stack
  pda.stack.push('$');

  // start variable state (rule 0)
  pda.stack.push('0');

  // add transition from loop state to match state
  pda.current.transitions.push({
    input: '!', // ! is epsilon
    requiredTop: '$',
    newTop: '!',
    to: State({match: true}),
  });

  // add terminals ("a" and "b") to loop state
  pda.current.transitions.push({
    input: 'a',
    requiredTop: 'a',
    newTop: '!',
    to: pda.current,
  });
  pda.current.transitions.push({
    input: 'b',
    requiredTop: 'b',
    newTop: '!',
    to: pda.current,
  });

  // add loops for each rule
  for (const [id, allDefinitions] of rules.entries()) {
    for (const definition of allDefinitions) {
      let last = pda.current;
      const values = definition.split(' ');
      for (const value of values.slice(0, values.length - 1)) {
        // go through all values of the rule except the last one
        // build the loop for this rule backwards
        // i.e. first character points to loop state, next character points to first character, etc.
        for (const char of value.split(' ')) {
          // make a new state that points to last
          const current = State({
            transitions: [
              {
                input: '!',
                requiredTop: '!',
                newTop: char,
                to: last,
              },
            ],
          });
          // update last
          last = current;
        }
      }
      // for the last value in the rule, we add a transition to the loop state that points to last
      pda.current.transitions.push({
        input: '!',
        requiredTop: id,
        newTop: values[values.length - 1],
        to: last,
      });
    }
  }

  return pda;
}

// given a list of pdas and a character, populate all possible future pdas
function getPossibleFutures(pdas: PDASet, char: string): PDASet {
  const futures = new PDASet();
  for (const pda of pdas) {
    if (pda.stack.length === 0) {
      // no transitions to take for this pda
      continue;
    }

    // find all transitions that are available
    for (const transition of pda.current.transitions) {
      if (
        transition.input === char && // character matches input and ...
        (transition.requiredTop === pda.stack[pda.stack.length - 1] || // (required top matches our current top or ...
          transition.requiredTop === '!') // required top is epsilon)
      ) {
        // if this transition is allowed, add a pda that takes it to futures
        const stack = [...pda.stack];
        if (transition.requiredTop !== '!') {
          // pop if this transition required a specific char
          stack.pop();
        }
        if (transition.newTop !== '!') {
          // if this transition has a new top, push it to the stack
          stack.push(transition.newTop);
        }

        // arbitrary transition limit
        if (pda.transitions < 1000) {
          futures.add({
            current: transition.to,
            stack,
            transitions: pda.transitions + 1,
          });
        } else {
          // console.log('hit transition limit!');
        }
      }
    }
  }

  return futures;
}

// take/don't take all epsilons until all epsilon futures are populated
function takeEpsilons(pdas: PDASet): PDASet {
  const next = getPossibleFutures(pdas, '!');
  if (pdas.hasAll(next)) {
    return pdas;
  } else {
    // find more epsilon paths
    pdas.addAll(next);
    return takeEpsilons(pdas);
  }
}

function simulate(pda: PDA, input: string): boolean {
  let current = new PDASet();
  current.add(pda);

  current = takeEpsilons(current);

  for (const char of input.split('')) {
    current = getPossibleFutures(current, char);
    current = takeEpsilons(current);
  }

  for (const pda of current) {
    if (pda.current.match) {
      return true;
    }
  }

  return false;
}

function part1(): number {
  const rules = new Map<string, string[]>();
  const strings: string[] = [];
  let makingRules = true;
  fileMapSync('src/2020/day19/input.txt', line => {
    if (line === '') {
      makingRules = false;
      return;
    }

    if (makingRules) {
      const [id, content] = line.split(': ');
      // strip quotes for terminals and split multi-rules
      rules.set(id, content.replace(/"/g, '').split(' | '));
    } else {
      strings.push(line);
    }
  });

  let count = 0;

  for (const string of strings) {
    const pda = createPDA(rules);
    if (simulate(pda, string)) {
      count++;
    }
  }

  return count;
}

function part2(): number {
  const rules = new Map<string, string[]>();
  const strings: string[] = [];
  let makingRules = true;
  fileMapSync('src/2020/day19/input.txt', line => {
    if (line === '') {
      makingRules = false;
      return;
    }

    if (makingRules) {
      const [id, content] = line.split(': ');
      // strip quotes for terminals and split multi-rules
      rules.set(id, content.replace(/"/g, '').split(' | '));
    } else {
      strings.push(line);
    }
  });

  // custom rules
  rules.set('8', ['42', '42 8']);
  rules.set('11', ['42 31', '42 11 31']);

  let count = 0;

  for (const string of strings) {
    const pda = createPDA(rules);
    // console.log(string);
    if (simulate(pda, string)) {
      // console.log(true);
      count++;
    } else {
      // console.log(false);
    }
  }

  return count;
}

printSolution(part1(), part2());
