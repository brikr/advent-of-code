import {MapWithDefault} from './../../utils/mapWithDefault';
import {cloneDeep} from 'lodash';
import {dequeue} from '../../utils/array';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';
import {SortedQueue} from '../../utils/sortedQueue';

const TEST_MODE = false;

interface Valve {
  name: string;
  connections: string[];
  flowRate: number;
}

interface ValveWithAllConnections {
  name: string;
  // key: valve name, value: distance
  connections: Map<string, number>;
  flowRate: number;
}

interface State {
  currentValve: string;
  // key: opened valve, valve: minute opened (easier debugging)
  openedValves: Map<string, number>;
  // amount of flow if we did nothing for the rest of the time
  totalFlow: number;
  minutesPassed: number;
}

// function checksum(state: State): string {
//   return `${state.currentValve};${Array.from(state.openedValves.values()).join(
//     ','
//   )};${state.totalFlow};${state.minutesPassed}`;
// }

function optimizeValves(
  valves: Map<string, Valve>
): Map<string, ValveWithAllConnections> {
  interface BFSState {
    currentValve: string;
    distance: number;
  }

  const map = new Map<string, ValveWithAllConnections>();

  for (const [fromValveName, fromValve] of valves.entries()) {
    const valve: ValveWithAllConnections = {
      name: fromValveName,
      connections: new Map<string, number>(),
      flowRate: fromValve.flowRate,
    };

    if (fromValve.flowRate === 0 && fromValveName !== 'AA') {
      // we're never gonna go here, so don't bother making an entry
      continue;
    }

    // console.log('creating optimized valves for', fromValveName, fromValve);

    bfs: for (const [toValveName, toValve] of valves.entries()) {
      if (toValveName === fromValveName) {
        // not considering self a neighbor means we will never open AA since we start there. in test input and my input
        // it has flow rate 0 so this works
        continue bfs;
      }

      if (toValve.flowRate === 0) {
        // we're never gonna go here, so don't bother making an entry
        continue bfs;
      }

      // console.log('  bfs searching to', toValveName);

      // bfs to find distance
      const queue: BFSState[] = [
        {
          currentValve: fromValveName,
          distance: 0,
        },
      ];
      const visited = new Set<string>();
      visited.add(fromValveName);

      while (queue.length > 0) {
        const curr = dequeue(queue)!;

        visited.add(curr.currentValve);

        if (curr.currentValve === toValveName) {
          // found shortest path
          valve.connections.set(toValveName, curr.distance);
          // console.log(
          //   '    found! distance',
          //   curr.distance,
          //   'queue size',
          //   queue.length
          // );
          continue bfs;
        }

        const neighbors = valves.get(curr.currentValve)!.connections;
        for (const neighbor of neighbors) {
          if (visited.has(neighbor)) {
            // already been
            continue;
          }
          const next: BFSState = {
            currentValve: neighbor,
            distance: curr.distance + 1,
          };
          queue.push(next);
        }
      }
    }

    map.set(fromValveName, valve);
  }

  return map;
}

function getFutures(state: State): State[] {
  const futures: State[] = [];

  for (const [neighbor, distance] of valves
    .get(state.currentValve)!
    .connections.entries()) {
    // part 1: just a future where only we move
    if (state.openedValves.has(neighbor)) {
      // already opened, don't go back
      continue;
    }

    const neighborValve = valves.get(neighbor)!;

    // create a future where we go to this neighbor and open the valve
    const next = cloneDeep(state);
    next.currentValve = neighbor;
    next.minutesPassed += distance; // for moving
    next.openedValves.set(next.currentValve, next.minutesPassed);
    next.minutesPassed++; // for opening
    next.totalFlow += neighborValve.flowRate * (30 - next.minutesPassed);

    if (next.minutesPassed <= 30) {
      futures.push(next);
    }
  }

  return futures;
}

function compareStates(a: State, b: State): number {
  // console.log(
  //   'comparing',
  //   a.currentValve,
  //   valves.get(a.currentValve)!.flowRate,
  //   b.currentValve,
  //   valves.get(b.currentValve)!.flowRate,
  //   a.totalFlow - b.totalFlow ||
  //     valves.get(a.currentValve)!.flowRate -
  //       valves.get(b.currentValve)!.flowRate
  // );
  return a.totalFlow - b.totalFlow;
}

// rval key: opened valves, number: highest known total flow for those valves
function findBestFlows(startingMinutes = 0): [Map<string, number>, number] {
  const initialState: State = {
    currentValve: 'AA',
    openedValves: new Map<string, number>(),
    totalFlow: 0,
    minutesPassed: startingMinutes,
  };

  const allFlows = new MapWithDefault<string, number>(0);
  let highestFlow = 0;

  // const visited = new Set<string>();
  const sortedQ = new SortedQueue<State>(compareStates, [initialState]);
  // const stack: State[] = [initialState];
  let statesChecked = 0;
  while (sortedQ.size > 0) {
    statesChecked++;
    if (TEST_MODE || statesChecked % 100000 === 0) {
      console.log(
        'states checked',
        statesChecked,
        'sortedQ length',
        sortedQ.size,
        'highest seen',
        highestFlow
      );
    }

    const current = sortedQ.dequeueMax()!;
    // console.log('looking at', current);

    const openedValvesStr = Array.from(current.openedValves.keys()).join(',');
    if (current.totalFlow > allFlows.get(openedValvesStr)) {
      // console.log('new highest for', openedValvesStr, current.totalFlow);
      allFlows.set(openedValvesStr, current.totalFlow);
    }

    const futures = getFutures(current);
    if (futures.length === 0 && current.totalFlow > highestFlow) {
      // dead end route, check for highest here as well
      highestFlow = current.totalFlow;
      console.log('new highest', highestFlow, current);
      // if (TEST_MODE && highestFlow === 1707) {
      //   return 1707;
      // }
    }
    sortedQ.enqueue(...futures);
    // console.log('sortedQ', sortedQ);
    // return 0;
  }

  return [allFlows, highestFlow];
}

function part1(): number {
  const [_, bestFlow] = findBestFlows();
  return bestFlow;
}

function part2(): number {
  const [allFlows, _] = findBestFlows(4);

  console.log(allFlows.size);

  let highestSeen = 0;

  let checked = 0;
  for (const [myValves, myFlow] of allFlows.entries()) {
    checked++;
    if (checked % 100 === 0) {
      console.log('checked', checked, 'of', allFlows.size);
    }
    const myValvesSet = new Set(myValves.split(','));

    elephant: for (const [elephantValves, elephantFlow] of allFlows.entries()) {
      // if the two valve sets are disjoint, then it's a possible solution
      for (const elephantValve of elephantValves.split(',')) {
        if (myValvesSet.has(elephantValve)) {
          // sets are not disjoint
          continue elephant;
        }
      }

      // they are disjoint!
      if (myFlow + elephantFlow > highestSeen) {
        highestSeen = myFlow + elephantFlow;
        console.log('new highest', myValves, elephantValves, highestSeen);
      }
    }
  }

  return highestSeen;
}

const unoptimizedValves = new Map<string, Valve>();
let totalNonZeroValves = 0;
fileMapSync(`src/2022/day16/input${TEST_MODE ? '-test' : ''}.txt`, line => {
  const [_, name, flowRateStr, connectionsStr] = line.match(
    /Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.+)/
  )!;
  const flowRate = Number(flowRateStr);
  const connections = connectionsStr.split(', ');
  unoptimizedValves.set(name, {name, connections, flowRate});

  if (flowRate > 0) {
    totalNonZeroValves++;
  }
});
const valves = optimizeValves(unoptimizedValves);
// console.log(valves);

printSolution(part1(), part2());
