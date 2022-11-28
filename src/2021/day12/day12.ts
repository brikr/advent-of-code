import {fileMapSync} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

function isSmallCave(node: string): boolean {
  return Boolean(node.match(/[a-z]/));
}

interface SearchState {
  current: string;
  smallCavesVisited: Set<string>;
  smallCaveVisitedTwice?: string; // p2
  path: string[];
}

function stateToString({
  path,
  smallCavesVisited,
  smallCaveVisitedTwice,
}: SearchState): string {
  return `${path.join(',')} ${
    smallCavesVisited.size > 2 ? ' yes' : ' no'
  } (${smallCaveVisitedTwice})`;
}

function part1(graph: MapWithDefault<string, string[]>): number {
  // dfs where we are allowed to revisit big caves
  // hope there's no infinite loops here
  const stack = [
    {
      current: 'start',
      smallCavesVisited: new Set(['start']),
      path: ['start'],
    },
  ];

  const fullStates = [];

  while (stack.length > 0) {
    const curr = stack.pop()!;

    // is this the end?
    if (curr.current === 'end') {
      fullStates.push(curr);
      continue;
    }

    // get connected nodes
    const connectedNodes = graph.get(curr.current);
    // for each connected node, if it's not a small cave we've visited, make a future state and push to stack
    for (const node of connectedNodes) {
      if (!curr.smallCavesVisited.has(node)) {
        // make a new state
        const smallCavesVisited = new Set(curr.smallCavesVisited);
        if (isSmallCave(node)) {
          smallCavesVisited.add(node);
        }
        const next = {
          current: node,
          smallCavesVisited,
          path: [...curr.path, node],
        };
        stack.push(next);
      }
    }
  }

  // console.log(fullStates.map(stateToString));

  return fullStates.filter(({smallCavesVisited}) => smallCavesVisited.size > 2)
    .length;
}

function part2(graph: MapWithDefault<string, string[]>): number {
  // dfs where we are allowed to revisit big caves
  // hope there's no infinite loops here
  const stack: SearchState[] = [
    {
      current: 'start',
      smallCavesVisited: new Set(['start']),
      path: ['start'],
    },
  ];

  const fullStates = [];

  while (stack.length > 0) {
    const curr = stack.pop()!;

    // console.debug('checking ', stateToString(curr));

    // is this the end?
    if (curr.current === 'end') {
      fullStates.push(curr);
      continue;
    }

    // get connected nodes
    const connectedNodes = graph.get(curr.current);
    // for each connected node, if it's not a small cave we've visited (or we are allowed to visit twice), make a future state and push to stack
    for (const node of connectedNodes) {
      const visitedAndSmall = curr.smallCavesVisited.has(node);

      // if it's big, or it's small and not visited, or it's small and visited but we haven't visited a small cave twice
      if (
        !visitedAndSmall ||
        (curr.smallCaveVisitedTwice === undefined && node !== 'start')
      ) {
        // make a new state
        const smallCavesVisited = new Set(curr.smallCavesVisited);
        if (isSmallCave(node)) {
          smallCavesVisited.add(node);
        }
        let smallCaveVisitedTwice: string | undefined =
          curr.smallCaveVisitedTwice;
        if (visitedAndSmall) {
          // we've already visited this place. make this a special state where we visited a cave twice
          smallCaveVisitedTwice = node;
        }
        const next = {
          current: node,
          smallCavesVisited,
          smallCaveVisitedTwice,
          path: [...curr.path, node],
        };
        stack.push(next);
      }
    }
  }

  // console.log(fullStates.map(stateToString));

  return fullStates.filter(({smallCavesVisited}) => smallCavesVisited.size > 2)
    .length;
}

const edges = fileMapSync('src/2021/day12/input.txt', line => line.split('-'));
// key=from, value=to. all edges are in here twice (both directions)
const graph = new MapWithDefault<string, string[]>([]);
edges.forEach(([a, b]) => {
  graph.set(a, [...graph.get(a), b]);
  graph.set(b, [...graph.get(b), a]);
});
printSolution(part1(graph), part2(graph));
