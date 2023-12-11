#include <file.h>
#include <grid.h>

#include <chrono>
#include <iostream>
#include <set>
#include <string>
#include <vector>

long solution(const std::vector<std::string> &lines, int timeDilation) {
  int width = lines[0].length();
  int height = lines.size();

  // find all empty rows and columns
  std::set<int> emptyRows{};
  for (int r = 0; r < height; r++) {
    const auto &line = lines[r];
    bool empty = true;
    for (char c : line) {
      if (c != '.') {
        empty = false;
        break;
      }
    }
    if (empty) {
      emptyRows.insert(r);
    }
  }

  std::set<int> emptyCols{};
  for (int c = 0; c < width; c++) {
    bool empty = true;
    for (const auto &line : lines) {
      if (line[c] != '.') {
        empty = false;
        break;
      }
    }
    if (empty) {
      emptyCols.insert(c);
    }
  }

  // enumerate all galaxies
  Grid2D<char> grid = linesToGrid(lines);
  std::set<Point2D> galaxies;
  for (const auto &pair : grid) {
    if (pair.second == '#') {
      galaxies.insert(pair.first);
    }
  }

  long totalDistance = 0;

  // for every pair of galaxies, calculate their distance
  for (const auto &a : galaxies) {
    for (const auto &b : galaxies) {
      if (b < a || b == a) continue;  // prevents counting a pair twice

      long distance = a.manhattanDistanceFrom(b);

      // if any of the row/columns between these two points are empty, add
      // timeDilation to the distance
      for (int y = std::min(a.y, b.y); y <= std::max(a.y, b.y); y++) {
        if (emptyRows.count(y) > 0) {
          distance += timeDilation;
        }
      }
      for (int x = std::min(a.x, b.x); x <= std::max(a.x, b.x); x++) {
        if (emptyCols.count(x) > 0) {
          distance += timeDilation;
        }
      }

      totalDistance += distance;
    }
  }

  return totalDistance;
}

int partOne(const std::vector<std::string> &lines) {
  return solution(lines, 1);
}

long partTwo(const std::vector<std::string> &lines) {
  return solution(lines, 999999);
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::cout << "Part 1:\n";
  std::cout << partOne(lines) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(lines) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
