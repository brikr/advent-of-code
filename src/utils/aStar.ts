import {HashMap} from './hashMap';
import {MapWithDefault} from './mapWithDefault';
import {SortedQueue} from './sortedQueue';

export abstract class AStarSolver<State> {
  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  fScore = new MapWithDefault<string, number>(Infinity);

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  openSet: SortedQueue<State>;

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  // This is used to retrace the path of the solution if necessary
  cameFrom = new HashMap<State, State>(this.stateToString.bind(this));

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  gScore = new MapWithDefault<string, number>(Infinity);

  // if false, aim for highest score instead of lowest
  minimize = true;

  finalState?: State;

  // if true, log some debug info as it searched
  debug = false;
  debugStateReportMod = 1;

  constructor(initialState: State) {
    this.openSet = new SortedQueue(this.compareStates.bind(this), [
      initialState,
    ]);
    this.gScoreSet(initialState, 0);
    this.fScoreSet(initialState, this.heuristicScore(initialState));
  }

  public solve(): number {
    let statesChecked = 0;
    while (this.openSet.size > 0) {
      let curr: State;
      if (this.minimize) {
        curr = this.openSet.dequeueMin()!;
      } else {
        curr = this.openSet.dequeueMax()!;
      }
      statesChecked++;

      if (this.debug && statesChecked % this.debugStateReportMod === 0) {
        console.log(
          'checked',
          statesChecked,
          'states',
          'current state',
          this.stateToString(curr),
          'queue size',
          this.openSet.size
        );
      }

      if (this.isFinish(curr)) {
        // we did it
        this.finalState = curr;
        if (this.debug) {
          console.log(
            'found winning state after',
            statesChecked,
            'states',
            this.stateToString(curr)
          );
        }
        return this.gScoreGet(curr);
      }

      const neighbors = this.getFutures(curr);
      for (const neighbor of neighbors) {
        // tentative_gScore is the distance from start to the neighbor through current
        const tentativeGScore =
          this.gScoreGet(curr) + this.traverseCost(curr, neighbor);

        if (this.isGScoreBetter(tentativeGScore, this.gScoreGet(neighbor))) {
          // this path to neighbor is better than any previous one. record it!
          this.cameFrom.set(neighbor, curr);
          this.gScoreSet(neighbor, tentativeGScore);
          this.fScoreSet(
            neighbor,
            tentativeGScore + this.heuristicScore(neighbor)
          );

          if (!this.openSet.includes(neighbor, this.statesEqual.bind(this))) {
            this.openSet.enqueue(neighbor);
          }
        }
      }
    }

    // woops
    return -1;
  }

  public traceSolution(): State[] {
    const rval: State[] = [];
    let curr = this.finalState;
    while (curr) {
      rval.push(curr);
      curr = this.cameFrom.get(curr);
    }
    return rval.reverse();
  }

  private isGScoreBetter(a: number, b: number): boolean {
    if (this.minimize) {
      return a < b;
    } else {
      return a > b;
    }
  }

  private compareStates(a: State, b: State): number {
    return this.fScoreGet(a) - this.fScoreGet(b);
  }

  private fScoreGet(state: State): number {
    return this.fScore.get(this.stateToString(state));
  }

  private fScoreSet(state: State, val: number) {
    this.fScore.set(this.stateToString(state), val);
  }

  private gScoreGet(state: State): number {
    return this.gScore.get(this.stateToString(state));
  }

  private gScoreSet(state: State, val: number) {
    this.gScore.set(this.stateToString(state), val);
  }

  private statesEqual(a: State, b: State): boolean {
    return this.stateToString(a) === this.stateToString(b);
  }

  // h is the heuristic function. h(n) estimates the cost to reach goal from node n.
  abstract heuristicScore(state: State): number;

  // string representation of a state. unique states must have unique strings
  abstract stateToString(state: State): string;

  // whether or not a state is a winning state
  abstract isFinish(state: State): boolean;

  // given a state, all neighboring states. it's ok if they back track
  abstract getFutures(state: State): State[];

  // d(current,neighbor) is the weight of the edge from current to neighbor
  abstract traverseCost(from: State, to: State): number;
}
