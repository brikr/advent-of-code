import {MapWithDefault} from './mapWithDefault';
import {SortedQueue} from './sortedQueue';

abstract class AStarSolver<State> {
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
  cameFrom = new Map<string, string>();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  gScore = new MapWithDefault<string, number>(Infinity);

  // if false, aim for highest score instead of lowest
  minimize = true;

  // if true, log some debug info as it searched
  debug = false;

  constructor(initialState: State) {
    this.openSet = new SortedQueue(this.compareStates, [initialState]);
    this.gScoreSet(initialState, 0);
    this.fScoreSet(initialState, this.heuristicScore(initialState));
  }

  public solve(): number {
    while (this.openSet.size > 0) {
      let curr: State;
      if (this.minimize) {
        curr = this.openSet.dequeueMin()!;
      } else {
        curr = this.openSet.dequeueMax()!;
      }

      if (this.isFinish(curr)) {
        // we did it
        return this.gScoreGet(curr);
      }

      const neighbors = this.getNeighbors(curr);
      for (const neighbor of neighbors) {
        // tentative_gScore is the distance from start to the neighbor through current
        const tentativeGScore =
          this.gScoreGet(curr) + this.traverseCost(curr, neighbor);

        if (this.isGScoreBetter(tentativeGScore, this.gScoreGet(neighbor))) {
          // this path to neighbor is better than any previous one. record it!
          this.cameFromSet(neighbor, curr);
          this.gScoreSet(neighbor, tentativeGScore);
          this.fScoreSet(
            neighbor,
            tentativeGScore + this.heuristicScore(neighbor)
          );

          if (!this.openSet.includes(neighbor, this.statesEqual)) {
            this.openSet.enqueue(neighbor);
          }
        }
      }
    }

    // woops
    return -1;
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

  private cameFromGet(state: State): string | undefined {
    return this.cameFrom.get(this.stateToString(state));
  }

  private cameFromSet(state: State, val: State) {
    this.cameFrom.set(this.stateToString(state), this.stateToString(val));
  }

  // h is the heuristic function. h(n) estimates the cost to reach goal from node n.
  abstract heuristicScore(state: State): number;

  // string representation of a state. unique states must have unique strings
  abstract stateToString(state: State): string;

  // whether or not a state is a winning state
  abstract isFinish(state: State): boolean;

  // given a state, all neighboring states. it's ok if they back track
  abstract getNeighbors(state: State): State[];

  // d(current,neighbor) is the weight of the edge from current to neighbor
  abstract traverseCost(from: State, to: State): number;

  // whether two states are identical
  abstract statesEqual(a: State, b: State): boolean;
}
