#include <file.h>
#include <grid.h>

#include <algorithm>
#include <chrono>
#include <iostream>
#include <set>
#include <stack>
#include <string>
#include <vector>

struct Beam {
  Point2D location;
  Point2D direction;
};

std::map<Point2D, Point2D> forwardMirrorDirections{
    {DELTA_UP, DELTA_RIGHT},
    {DELTA_DOWN, DELTA_LEFT},
    {DELTA_LEFT, DELTA_DOWN},
    {DELTA_RIGHT, DELTA_UP},
};
std::map<Point2D, Point2D> backMirrorDirections{
    {DELTA_UP, DELTA_LEFT},
    {DELTA_DOWN, DELTA_RIGHT},
    {DELTA_LEFT, DELTA_UP},
    {DELTA_RIGHT, DELTA_DOWN},
};

void printEnergized(const Grid2D<std::set<Point2D>> &energized,
                    const Grid2D<char> &grid) {
  std::cout << "\033[H\033[J";
  int currentY = grid.begin()->first.y;
  for (const auto &pair : grid) {
    if (pair.first.y != currentY) {
      std::cout << std::endl;
      currentY = pair.first.y;
    }

    if (auto it = energized.find(pair.first);
        it != energized.end() && it->second.size() > 0) {
      std::cout << '#';
    } else {
      std::cout << '.';
    }
  }
  std::cout << std::endl << std::endl;
}

int simulate(const Grid2D<char> &grid, Beam init) {
  Grid2D<std::set<Point2D>> energized{};

  std::stack<Beam> beams{};
  beams.push(init);

  while (beams.size() > 0) {
    auto curr = beams.top();
    beams.pop();

    if (auto it = energized.find(curr.location);
        it != energized.end() && it->second.count(curr.direction) > 0) {
      // already been here
      continue;
    } else {
      // haven't been here
      energized[curr.location].insert(curr.direction);
    }
    // printEnergized(energized, grid);
    // std::cout << std::endl;

    // direction changin' / splittin'
    if (grid.at(curr.location) == '/') {
      curr.direction = forwardMirrorDirections[curr.direction];
    } else if (grid.at(curr.location) == '\\') {
      curr.direction = backMirrorDirections[curr.direction];
    } else if (grid.at(curr.location) == '-') {
      if (curr.direction == DELTA_UP || curr.direction == DELTA_DOWN) {
        // send this beam right and make a new one going left
        Beam other{curr.location, DELTA_LEFT};
        beams.push(other);

        curr.direction = DELTA_RIGHT;
      }
      // left/right: treat as empty
    } else if (grid.at(curr.location) == '|') {
      if (curr.direction == DELTA_LEFT || curr.direction == DELTA_RIGHT) {
        // send this beam up and make a new one going down
        Beam other{curr.location, DELTA_DOWN};
        beams.push(other);

        curr.direction = DELTA_UP;
      }
      // up/down: treat as empty
    }
    // else: empty space

    Point2D next = curr.location + curr.direction;

    if (!grid.inBounds(next)) {
      // good bye beam
      continue;
    }

    curr.location = next;
    beams.push(curr);
  }

  return energized.size();
}

int partOne(const Grid2D<char> &grid) {
  return simulate(grid, Beam{{0, 0}, DELTA_RIGHT});
}

int partTwo(const Grid2D<char> &grid) {
  int max = 0;

  // top aiming down
  for (int x = grid.xBounds.min; x <= grid.xBounds.max; x++) {
    Beam init{{x, grid.yBounds.min}, DELTA_DOWN};
    int result = simulate(grid, init);
    max = std::max(result, max);
  }

  // bottom aiming up
  for (int x = grid.xBounds.min; x <= grid.xBounds.max; x++) {
    Beam init{{x, grid.yBounds.max}, DELTA_UP};
    int result = simulate(grid, init);
    max = std::max(result, max);
  }

  // left aiming right
  for (int y = grid.yBounds.min; y <= grid.yBounds.max; y++) {
    Beam init{{grid.xBounds.min, y}, DELTA_RIGHT};
    int result = simulate(grid, init);
    max = std::max(result, max);
  }

  // right aiming left
  for (int y = grid.yBounds.min; y <= grid.yBounds.max; y++) {
    Beam init{{grid.xBounds.max, y}, DELTA_LEFT};
    int result = simulate(grid, init);
    max = std::max(result, max);
  }

  return max;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  auto grid = linesToGrid(lines);

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
