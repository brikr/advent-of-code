import {fileMap} from '../../utils/file';

interface BagRule {
  parent: string;
  contains: {
    color: string;
    count: number;
  }[];
}

interface ParentTree {
  // key: bag color, value: all bag rules where that color is in the contains array
  [color: string]: BagRule[];
}

function addToTree(tree: ParentTree, color: string, bagRule: BagRule) {
  if (tree[color] === undefined) {
    tree[color] = [bagRule];
  } else {
    tree[color].push(bagRule);
  }
}

async function part1(): Promise<number> {
  const containsTree: ParentTree = {};

  await fileMap('src/2020/day07/input.txt', line => {
    // parse the line
    const match = line.match(
      /(\w+ \w+) bags contain ((( ?\d+ \w+ \w+ bags?,?)+)|no other bags)/
    ) as RegExpMatchArray;
    const parent = match[1];
    const children = match[2] === 'no other bags' ? [] : match[2].split(',');
    const bagRule: BagRule = {
      parent,
      contains: children.map(child => {
        const childMatch = child.match(
          /(\d+) (\w+ \w+) bags?\.?/
        ) as RegExpMatchArray;
        const count = childMatch[1];
        const color = childMatch[2];
        return {
          color,
          count: Number(count),
        };
      }),
    };

    // add all children to our contains tree
    for (const child of bagRule.contains) {
      addToTree(containsTree, child.color, bagRule);
    }
  });

  // now, traverse our tree and keep track of all bags that might contain shiny gold
  const toCheck = [...containsTree['shiny gold']];
  const possibleParents = new Set<string>();
  while (toCheck.length > 0) {
    const parentRule = toCheck.pop()!;
    possibleParents.add(parentRule.parent);
    const next = containsTree[parentRule.parent];
    if (next !== undefined) {
      for (const rule of next) {
        toCheck.push(rule);
      }
    }
  }

  return possibleParents.size;
}

interface BagRuleMap {
  [color: string]: BagRule;
}

function totalBags(ruleMap: BagRuleMap, color: string) {
  const {contains} = ruleMap[color];
  let total = 1; //myself
  for (const contain of contains) {
    total += contain.count * totalBags(ruleMap, contain.color);
  }
  return total;
}

async function part2(): Promise<number> {
  const map: BagRuleMap = {};

  await fileMap('src/2020/day07/input.txt', line => {
    // parse the line
    const match = line.match(
      /(\w+ \w+) bags contain ((( ?\d+ \w+ \w+ bags?,?)+)|no other bags)/
    ) as RegExpMatchArray;
    const parent = match[1];
    const children = match[2] === 'no other bags' ? [] : match[2].split(',');
    const bagRule: BagRule = {
      parent,
      contains: children.map(child => {
        const childMatch = child.match(
          /(\d+) (\w+ \w+) bags?\.?/
        ) as RegExpMatchArray;
        const count = childMatch[1];
        const color = childMatch[2];
        return {
          color,
          count: Number(count),
        };
      }),
    };

    // add the rule to our map
    map[bagRule.parent] = bagRule;
  });

  // don't count the shiny gold bag
  return totalBags(map, 'shiny gold') - 1;
}

async function printSolution() {
  console.log('Part 1:');
  console.log(await part1());
  console.log('Part 2:');
  console.log(await part2());
}

printSolution();
