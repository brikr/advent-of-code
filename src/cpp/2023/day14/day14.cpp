#include <file.h>
#include <grid.h>

#include <chrono>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

// returns a "hash" of round boulder locations
std::string slideRocks(Grid2D<char> &grid, const Point2D &delta) {
  // std::cout << "Before" << std::endl;
  // grid.print();

  // !! final is exclusive
  int initialX, initialY, finalX, finalY, loopX, loopY;
  if (delta == DELTA_UP) {
    // top to bottom, left to right
    initialY = grid.yBounds.min;
    finalY = grid.yBounds.max + 1;
    initialX = grid.xBounds.min;
    finalX = grid.xBounds.max + 1;
    loopY = 1;
    loopX = 1;
  } else if (delta == DELTA_DOWN) {
    // bottom to top, left to right
    initialY = grid.yBounds.max;
    finalY = grid.yBounds.min - 1;
    initialX = grid.xBounds.min;
    finalX = grid.xBounds.max + 1;
    loopY = -1;
    loopX = 1;
  } else if (delta == DELTA_LEFT) {
    // top to bottom, left to right
    initialY = grid.yBounds.min;
    finalY = grid.yBounds.max + 1;
    initialX = grid.xBounds.min;
    finalX = grid.xBounds.max + 1;
    loopY = 1;
    loopX = 1;
  } else if (delta == DELTA_RIGHT) {
    // top to bottom, right to left
    initialY = grid.yBounds.min;
    finalY = grid.yBounds.max + 1;
    initialX = grid.xBounds.max;
    finalX = grid.xBounds.min - 1;
    loopY = 1;
    loopX = -1;
  }

  std::ostringstream oss;

  for (int y = initialY; y != finalY; y += loopY) {
    for (int x = initialX; x != finalX; x += loopX) {
      Point2D here{x, y};

      if (grid[here] == 'O') {
        // remove the rock from its original place
        grid[here] = '.';
        // travel in delta direction until we find something that would block
        // this rock
        here = here + delta;
        while (grid.yBounds.contains(here.y) && grid.xBounds.contains(here.x) &&
               grid[here] == '.') {
          here = here + delta;
        }
        // here is slightly too far; move it back one space to be where the rock
        // should go
        here = here - delta;
        // place the rock
        grid[here] = 'O';

        // add the rock location to the stream
        oss << here.x << "," << here.y << ";";
      }
    }
  }

  // std::cout << "After" << std::endl;
  // grid.print();
  return oss.str();
}

int northLoad(const Grid2D<char> &grid) {
  int totalLoad = 0;
  for (const auto &pair : grid) {
    if (pair.second == 'O') {
      int load = grid.yBounds.max - pair.first.y + 1;
      totalLoad += load;
    }
  }
  return totalLoad;
}

int partOne(const Grid2D<char> &original) {
  auto grid = original;
  slideRocks(grid, DELTA_UP);
  return northLoad(grid);
}

int partTwo(const Grid2D<char> &original) {
  auto grid = original;

  std::map<std::string, int> cycleHashes{};

  bool timeTraveled = false;
  for (int cycles = 0; cycles < 1000000000; cycles++) {
    // if (cycles % 10 == 0) {
    //   std::cout << "Cycles: " << cycles << std::endl;
    // }
    slideRocks(grid, DELTA_UP);
    slideRocks(grid, DELTA_LEFT);
    slideRocks(grid, DELTA_DOWN);
    auto hash = slideRocks(grid, DELTA_RIGHT);

    // int load = northLoad(grid);
    // std::cout << "After cycle " << cycles << " (load " << load << ")"
    //           << std::endl;
    // grid.print();

    if (!timeTraveled && cycleHashes.count(hash) != 0) {
      int phaseStart = cycleHashes[hash];
      int phaseSize = cycles - phaseStart;

      // std::cout << "Repeat! Cycle " << cycles << " is the same as cycle "
      //           << phaseStart << ". Phase size: " << phaseSize << std::endl;

      // time travel
      int remaining = 1000000000 - cycles;
      int numPhases = remaining / phaseSize;
      cycles += numPhases * phaseSize;
      timeTraveled = true;
    } else {
      cycleHashes[hash] = cycles;
    }
  }

  return northLoad(grid);
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
