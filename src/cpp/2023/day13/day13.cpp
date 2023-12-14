#include <file.h>

#include <chrono>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

#include "grid.h"

int totalMirrorRowDiff(const Grid2D<char> &grid, int y, int maxDiff) {
  int diff = 0;
  int yMirror = y + 1;
  while (y >= 0 && yMirror <= grid.yBounds.max) {
    auto yRow = grid.row(y);
    auto yMirrorRow = grid.row(yMirror);

    auto yRowIt = yRow.begin();
    auto yMirrorRowIt = yMirrorRow.begin();
    while (yRowIt != yRow.end()) {
      if (*yRowIt != *yMirrorRowIt) {
        diff++;
        if (diff > maxDiff) {
          return std::numeric_limits<int>::max();
        }
      }

      yRowIt++;
      yMirrorRowIt++;
    }

    y--;
    yMirror++;
  }

  return diff;
}

int totalMirrorColDiff(const Grid2D<char> &grid, int x, int maxDiff) {
  int diff = 0;
  int xMirror = x + 1;
  while (x >= 0 && xMirror <= grid.xBounds.max) {
    auto xCol = grid.col(x);
    auto xMirrorCol = grid.col(xMirror);

    auto xColIt = xCol.begin();
    auto xMirrorColIt = xMirrorCol.begin();
    while (xColIt != xCol.end()) {
      if (*xColIt != *xMirrorColIt) {
        diff++;
        if (diff > maxDiff) {
          return std::numeric_limits<int>::max();
        }
      }

      xColIt++;
      xMirrorColIt++;
    }

    x--;
    xMirror++;
  }

  return diff;
}

// pass the upper row as y
bool isMirrorRow(const Grid2D<char> &grid, int y) {
  int yMirror = y + 1;
  while (y >= 0 && yMirror <= grid.yBounds.max) {
    auto yRow = grid.row(y);
    auto yMirrorRow = grid.row(yMirror);

    if (yRow != yMirrorRow) {
      // mirror broken
      return false;
    }

    y--;
    yMirror++;
  }

  // mirror unbroken
  return true;
}

// pass the left col as x
bool isMirrorCol(const Grid2D<char> &grid, int x) {
  int xMirror = x + 1;
  while (x >= 0 && xMirror <= grid.xBounds.max) {
    auto xCol = grid.col(x);
    auto xMirrorCol = grid.col(xMirror);

    if (xCol != xMirrorCol) {
      // mirror broken
      return false;
    }

    x--;
    xMirror++;
  }

  // mirror unbroken
  return true;
}

int calculateSummary(const std::vector<Grid2D<char>> &grids, int desiredDiff) {
  int summary = 0;

  for (const auto &grid : grids) {
    for (int y = grid.yBounds.min; y < grid.yBounds.max; y++) {
      int diff = totalMirrorRowDiff(grid, y, desiredDiff);
      if (diff == desiredDiff) {
        summary += 100 * (y + 1);
      }
    }

    for (int x = grid.xBounds.min; x < grid.xBounds.max; x++) {
      int diff = totalMirrorColDiff(grid, x, desiredDiff);
      if (diff == desiredDiff) {
        summary += x + 1;
      }
    }
  }

  return summary;
}

int partOne(const std::vector<Grid2D<char>> &grids) {
  return calculateSummary(grids, 0);
}

int partTwo(const std::vector<Grid2D<char>> &grids) {
  return calculateSummary(grids, 1);
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::vector<Grid2D<char>> grids{};
  std::vector<std::string> currentLines{};
  for (const auto &line : lines) {
    if (line == "") {
      auto grid = linesToGrid(currentLines);
      grids.push_back(grid);
      currentLines.clear();
    } else {
      currentLines.push_back(line);
    }
  }
  auto grid = linesToGrid(currentLines);
  grids.push_back(grid);

  std::cout << "Part 1:\n";
  std::cout << partOne(grids) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(grids) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
