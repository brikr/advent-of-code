#include <file.h>
#include <grid.h>

#include <algorithm>
#include <chrono>
#include <iostream>
#include <queue>
#include <set>
#include <string>
#include <vector>

const std::map<char, std::set<Point2D>> pipeTypes{
    {'|', std::set<Point2D>{DELTA_UP, DELTA_DOWN}},
    {'-', std::set<Point2D>{DELTA_LEFT, DELTA_RIGHT}},
    {'L', std::set<Point2D>{DELTA_UP, DELTA_RIGHT}},
    {'J', std::set<Point2D>{DELTA_UP, DELTA_LEFT}},
    {'7', std::set<Point2D>{DELTA_LEFT, DELTA_DOWN}},
    {'F', std::set<Point2D>{DELTA_RIGHT, DELTA_DOWN}},
};

char startPipeType(const Grid2D<char> &grid, const Point2D &start) {
  // get deltas of adjacent pipes
  std::set<Point2D> deltas;
  auto adjacent = grid.pointsAdjacent(start);
  for (const auto &pair : adjacent) {
    if (pair.second == '.') {
      continue;
    }
    // calc delta from that pipe to this pipe
    Point2D delta = start - pair.first;
    // if that delta is in the pipeType vector, then it connects
    auto pipeDeltas = pipeTypes.at(pair.second);
    if (pipeDeltas.count(delta) != 0) {
      // add delta from this pipe to that pipe to set
      deltas.insert(pair.first - start);
    }
  }

  // find pipeType that has same delta set as this one
  for (const auto &pair : pipeTypes) {
    if (deltas == pair.second) {
      return pair.first;
    }
  }

  // uh-oh
  return '.';
}

// no bounds checking on the grid, beware
std::map<Point2D, char> connectedPipes(const Grid2D<char> &grid,
                                       const Point2D &point, char pipe) {
  std::map<Point2D, char> connected{};

  if (pipe == 'S') {
    // find pipes that connect to this one
    auto adjacent = grid.pointsAdjacent(point);
    for (const auto &pair : adjacent) {
      if (pair.second == '.') {
        continue;
      }
      // calc delta from that pipe to this pipe
      Point2D delta = point - pair.first;
      // if that delta is in the pipeType vector, then it connects
      auto pipeDeltas = pipeTypes.at(pair.second);
      if (pipeDeltas.count(delta) != 0) {
        connected[pair.first] = pair.second;
      }
    }
  } else {
    // we know this pipe type; jus find connected using type map
    auto deltas = pipeTypes.at(pipe);
    for (const auto &delta : deltas) {
      Point2D other = point + delta;
      if (auto found = grid.find(other); found != grid.end()) {
        connected[other] = found->second;
      }
    }
  }

  return connected;
}

int partOne(const Grid2D<char> &grid) {
  Point2D start{0, 0};
  for (const auto &pair : grid) {
    if (pair.second == 'S') {
      start = pair.first;
      break;
    }
  }

  std::map<Point2D, int> distance{};
  int highestDistance = 0;

  // BFSin'
  std::queue<Point2D> q;
  q.push(start);
  while (q.size() > 0) {
    Point2D currentPoint = q.front();
    q.pop();
    char currentPipe = grid.at(currentPoint);
    int currentDistance = distance[currentPoint];  // might be zero!
    for (const auto &pair : connectedPipes(grid, currentPoint, currentPipe)) {
      if (distance.count(pair.first) != 0) {
        // visited
        continue;
      }
      q.push(pair.first);
      int newDistance = currentDistance + 1;
      distance[pair.first] = newDistance;
      if (newDistance > highestDistance) {
        highestDistance = newDistance;
      }
    }
  }

  return highestDistance;
}

int partTwo(const Grid2D<char> &grid) {
  // 1: find all pipes in the cycle
  Point2D start{0, 0};
  for (const auto &pair : grid) {
    if (pair.second == 'S') {
      start = pair.first;
      break;
    }
  }

  std::map<Point2D, char> pipes;
  Point2D bottomRight{0, 0};

  // BFSin'
  std::queue<Point2D> cycleQ;
  cycleQ.push(start);
  while (cycleQ.size() > 0) {
    Point2D currentPoint = cycleQ.front();
    cycleQ.pop();
    char currentPipe = grid.at(currentPoint);

    // update max
    if (currentPoint.x > bottomRight.x) {
      bottomRight.x = currentPoint.x;
    }
    if (currentPoint.y > bottomRight.y) {
      bottomRight.y = currentPoint.y;
    }

    // enqueue neighbors
    for (const auto &pair : connectedPipes(grid, currentPoint, currentPipe)) {
      if (pipes.count(pair.first) != 0) {
        // visited
        continue;
      }
      cycleQ.push(pair.first);
      pipes[pair.first] = pair.second;
    }
  }

  // 2: make a new grid that is 3x the old grid's size
  Grid2D<char> bigGrid(true);
  Point2D bigBottomRight = bottomRight * 3 + DELTA_DOWN_RIGHT * 2;
  // fill large grid with .'s to start
  for (int y = 0; y <= bigBottomRight.y; y++) {
    for (int x = 0; x <= bigBottomRight.x; x++) {
      bigGrid[Point2D{x, y}] = '.';
    }
  }

  // put in the pipes that are part of our cycle
  for (const auto &pair : pipes) {
    Point2D cellTopLeft = pair.first * 3;
    Point2D cellCenter = cellTopLeft + DELTA_DOWN_RIGHT;

    // we don't care about maintaining S in the grid here; replace it with the
    // actual pipe
    char pipe = pair.second == 'S' ? startPipeType(grid, start) : pair.second;

    // in the middle of the cell, put the original pipe
    bigGrid[cellCenter] = pipe;

    // in the directions this pipe goes, add | or -
    for (const auto &delta : pipeTypes.at(pipe)) {
      if (delta == DELTA_UP || delta == DELTA_DOWN) {
        bigGrid[cellCenter + delta] = '|';
      } else {
        bigGrid[cellCenter + delta] = '-';
      }
    }
  }

  // 3: start at 0,0 and fill with new symbol
  std::queue<Point2D> fillQ;
  fillQ.push(Point2D{0, 0});
  while (fillQ.size() > 0) {
    Point2D curr = fillQ.front();
    fillQ.pop();

    if (bigGrid.at(curr) != '.') {
      // don't do anything if this spot is not empty or is already marked
      continue;
    }

    // mark this spot
    bigGrid[curr] = 'O';

    // enqueue neighbors
    for (const auto &pair : bigGrid.pointsAdjacent(curr)) {
      fillQ.push(pair.first);
    }
  }

  // 4 count .'s that are in the middle of 3x3 cells
  int count = 0;
  for (int y = 1; y < bigBottomRight.y; y += 3) {
    for (int x = 1; x < bigBottomRight.x; x += 3) {
      if (bigGrid[Point2D{x, y}] == '.') {
        count++;
      }
    }
  }
  return count;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  auto grid = linesToGrid(lines);
  grid.excludeDiagonals = true;

  std::cout << "Part 1:\n";
  std::cout << partOne(grid) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(grid) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
