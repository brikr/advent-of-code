import {MapWithDefault} from './../../utils/mapWithDefault';
import {SortedQueue} from './../../utils/sortedQueue';
import {cloneDeep} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

const RESOURCES = ['ore', 'clay', 'obsidian', 'geode'] as const;
type Resource = typeof RESOURCES[number];

type Cost = {
  [key in Resource]: number;
};

interface Blueprint {
  id: number;
  oreRobot: Cost;
  clayRobot: Cost;
  obsidianRobot: Cost;
  geodeRobot: Cost;
}

interface State {
  timePassed: number;
  oreCount: number;
  clayCount: number;
  obsidianCount: number;
  geodeCount: number;
  oreRobotCount: number;
  clayRobotCount: number;
  obsidianRobotCount: number;
  geodeRobotCount: number;
  robotsBuilt?: Map<number, Resource>;
}

// performs one minute of gathering on a state, in place
function gatherResources(state: State, minutes = 1): State {
  for (const resource of RESOURCES) {
    state[`${resource}Count`] += state[`${resource}RobotCount`] * minutes;
  }
  return state;
}

// builds a robot. assumes the robot can be afforded. modifies the state in place
function buildRobot(
  state: State,
  robotType: Resource,
  blueprint: Blueprint
): State {
  for (const resource of RESOURCES) {
    state[`${resource}Count`] -= blueprint[`${robotType}Robot`][resource];
  }
  state[`${robotType}RobotCount`]++;
  return state;
}

function listBuildableRobots(state: State, blueprint: Blueprint): Resource[] {
  const rval: Resource[] = [];
  robots: for (const robotType of RESOURCES) {
    for (const resource of RESOURCES) {
      if (
        state[`${resource}Count`] < blueprint[`${robotType}Robot`][resource]
      ) {
        // cannot afford
        continue robots;
      }
    }
    // can afford!
    rval.push(robotType);
  }
  // console.log('listBuildableRobots', state, rval);
  return rval;
}

// makes a future that builds the specified robot as early as possible
// if it's not possible to build that robot next, undefined is returned
function createFutureForRobotBuild(
  state: State,
  robotType: Resource,
  blueprint: Blueprint,
  timeLimit: number
): State | undefined {
  const cost = blueprint[`${robotType}Robot`];
  let minutesNeeded = 0;
  for (const resource of RESOURCES) {
    if (cost[resource] === 0) {
      // don't need this mf
      continue;
    } else if (state[`${resource}RobotCount`] === 0) {
      // we don't have the robot yet and can never build this next
      return undefined;
    }
    const amountNeeded = cost[resource] - state[`${resource}Count`];
    const minutesNeededForThisResource = Math.ceil(
      amountNeeded / state[`${resource}RobotCount`]
    );
    minutesNeeded = Math.max(minutesNeeded, minutesNeededForThisResource);
  }
  if (state.timePassed + minutesNeeded + 1 > timeLimit) {
    // we can't build this robot in time, don't bother
    return undefined;
  }
  // this robot is buildable in time! make the future
  const next = cloneDeep(state);
  next.timePassed += minutesNeeded;
  // gathering +1 minutes on needed because we still gather the minute we build
  gatherResources(next, minutesNeeded + 1);
  next.timePassed++;
  next.robotsBuilt?.set(next.timePassed, robotType);
  buildRobot(next, robotType, blueprint);
  return next;
}

// compares two states for greedy searching
function compareStates(a: State, b: State): number {
  return (
    a.geodeCount - b.geodeCount ||
    a.geodeRobotCount - b.geodeRobotCount ||
    a.obsidianRobotCount - b.obsidianRobotCount ||
    a.clayRobotCount - b.clayRobotCount ||
    a.oreRobotCount - b.oreRobotCount ||
    a.obsidianCount - b.obsidianCount ||
    a.clayCount - b.clayCount ||
    a.oreCount - b.oreCount ||
    a.timePassed - b.timePassed
  );
}

// returns the number of geodes produced in timeLimit minutes
function findOptimalGeodeProduction(
  blueprint: Blueprint,
  timeLimit: number
): number {
  const initialState: State = {
    timePassed: 0,
    oreCount: 0,
    clayCount: 0,
    obsidianCount: 0,
    geodeCount: 0,
    oreRobotCount: 1,
    clayRobotCount: 0,
    obsidianRobotCount: 0,
    geodeRobotCount: 0,
    // robotsBuilt: new Map<number, Resource>(),
  };
  // states we are exploring
  const states = new SortedQueue<State>(compareStates, [initialState]);
  // const states: State[] = [initialState];
  // highest geodeCount found in a state with 24 minutes passed
  let highestFound = 0;
  // number of states looked at
  let lookedAt = 0;
  // best state score (via stateScore()) for each minute passed that we've seen
  const bestForEachMinute = new MapWithDefault<number, number>(0);

  // we can only build one robot per minute, so we don't need more of a robot than we could spend in a minute
  const maxes: Cost = {
    ore: Math.max(
      blueprint.oreRobot.ore,
      blueprint.clayRobot.ore,
      blueprint.obsidianRobot.ore,
      blueprint.geodeRobot.ore
    ),
    clay: blueprint.obsidianRobot.clay,
    obsidian: blueprint.geodeRobot.obsidian,
    geode: Number.MAX_SAFE_INTEGER,
  };

  while (states.length > 0) {
    const curr = states.pop()!;
    lookedAt++;
    if (lookedAt % 100000 === 0) {
      // console.log(
      //   'looked at',
      //   lookedAt,
      //   'states; queue size',
      //   states.length,
      //   'blueprint',
      //   blueprint.id
      // );
      // console.log('looking at', curr);
    }
    // console.log('looking at', curr);

    const bestForThisMinute = bestForEachMinute.get(curr.timePassed);
    const geodeCount = curr.geodeCount;
    if (geodeCount < bestForThisMinute) {
      // don't prune just yet; consider an extreme future where we build a geode robot every turn, could _that_ beat our best?
      let couldBeat = false;
      let potentialGeodeRobotCount = curr.geodeRobotCount;
      let potentialGeodeCount = curr.geodeCount;
      for (let t = curr.timePassed + 1; t <= timeLimit; t++) {
        const bestAtT = bestForEachMinute.get(t);
        potentialGeodeCount += potentialGeodeRobotCount;
        potentialGeodeRobotCount++;
        if (potentialGeodeCount >= bestAtT) {
          couldBeat = true;
          break;
        }
      }
      // it's a real dead end
      if (!couldBeat) {
        continue;
      }
    } else {
      // on the right track
      bestForEachMinute.set(curr.timePassed, geodeCount);
      for (let t = curr.timePassed + 1; t <= timeLimit; t++) {
        const best = bestForEachMinute.get(t);
        if (geodeCount > best) {
          bestForEachMinute.set(t, geodeCount);
        } else {
          break;
        }
      }
    }

    if (curr.timePassed >= timeLimit) {
      // tims up
      if (curr.geodeCount > highestFound) {
        // console.log(
        //   'new highest for blueprint',
        //   blueprint.id,
        //   curr.geodeCount,
        //   curr
        // );
        // console.log('best for each', bestForEachMinute);
        highestFound = curr.geodeCount;
      }
    } else {
      // create futures
      const futures: State[] = [];

      // // BUILD FUTURES ONE MINUTE AT A TIME
      // // advance tim
      // curr.timePassed++;

      // // snapshot the buildable robots. can't build em yet, because we need to gather resources first
      // const buildableRobots = listBuildableRobots(curr, blueprint);

      // gatherResources(curr);

      // // add the future where we build nothing
      // // curr was modified in place by gatherResources(), so it has the advanced time
      // futures.push(curr);

      // // create a future where we build each buildable robot
      // // use the snapshot value, because we can't spend resources we just gathered
      // for (const robotType of buildableRobots) {
      //   const next = cloneDeep(curr);
      //   buildRobot(next, robotType, blueprint);
      //   futures.push(next);
      // }

      // BUILD FUTURES ONE ROBOT AT A TIME
      for (const robotType of RESOURCES) {
        if (curr[`${robotType}RobotCount`] >= maxes[robotType]) {
          // we don't need any more of this robot
          continue;
        }
        const futureForRobot = createFutureForRobotBuild(
          curr,
          robotType,
          blueprint,
          timeLimit
        );
        if (futureForRobot) {
          // if (lookedAt % 100 === 0) {
          //   console.log('  future', futureForRobot);
          // }
          futures.push(futureForRobot);
        }
      }

      if (futures.length === 0) {
        // no more robots can be built from here, so gather until TIME_LIMIT and check if it's a winner
        gatherResources(curr, timeLimit - curr.timePassed);
        curr.timePassed = timeLimit - 1;
        if (curr.geodeCount > highestFound) {
          // console.log(
          //   'new highest for blueprint',
          //   blueprint.id,
          //   curr.geodeCount,
          //   curr
          // );
          // console.log('best for each', bestForEachMinute);
          highestFound = curr.geodeCount;
        }
      }

      // console.log('  found', futures.length, 'futures');
      states.push(...futures);
    }
  }

  // console.log('looked at', lookedAt, 'states');
  return highestFound;
}

function part1(blueprints: Blueprint[]): number {
  let total = 0;
  const results = new Map<number, number>();
  for (const blueprint of blueprints) {
    const geodes = findOptimalGeodeProduction(blueprint, 24);
    // console.log('blueprint', blueprint.id, ':', geodes, 'geodes');
    results.set(blueprint.id, geodes);
    total += blueprint.id * geodes;
  }
  // console.log('results', results);
  return total;
}

function part2(blueprints: Blueprint[]): number {
  let product = 1;
  const results = new Map<number, number>();
  for (const blueprint of blueprints.slice(0, 3)) {
    const geodes = findOptimalGeodeProduction(blueprint, 32);
    // console.log('blueprint', blueprint.id, ':', geodes, 'geodes');
    results.set(blueprint.id, geodes);
    product *= geodes;
  }
  // console.log('results', results);
  return product;
}

const blueprints = fileMapSync('src/2022/day19/input.txt', line => {
  const [
    id,
    oreOre,
    clayOre,
    obsidianOre,
    obsidianClay,
    geodeOre,
    geodeObsidian,
  ] = line.match(/(\d)+/g)!.map(Number);

  return {
    id,
    oreRobot: {
      ore: oreOre,
      clay: 0,
      obsidian: 0,
      geode: 0,
    },
    clayRobot: {
      ore: clayOre,
      clay: 0,
      obsidian: 0,
      geode: 0,
    },
    obsidianRobot: {
      ore: obsidianOre,
      clay: obsidianClay,
      obsidian: 0,
      geode: 0,
    },
    geodeRobot: {
      ore: geodeOre,
      clay: 0,
      obsidian: geodeObsidian,
      geode: 0,
    },
  };
});
printSolution(part1(blueprints), part2(blueprints));
