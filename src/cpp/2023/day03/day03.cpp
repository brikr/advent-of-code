#include <file.h>
#include <grid.h>

#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <vector>

bool isDigit(char ch) { return ch >= '0' && ch <= '9'; }

bool isSymbol(char ch) { return !isDigit(ch) && ch != '.'; }

int partOne(Grid2D<char> grid) {
  int total = 0;
  Point2D bottomRight = grid.rbegin()->first;
  for (int y = 0; y <= bottomRight.y; y++) {
    int currentNumber = 0;
    bool hasSymbol = false;
    for (int x = 0; x <= bottomRight.x; x++) {
      Point2D point{x, y};

      // Figure out the new value of currentNumber
      char ch = grid[point];
      if (isDigit(ch)) {
        // Grow the current number
        currentNumber *= 10;
        currentNumber += ch - '0';

        // Check if there is a symbol near this point if this number doesn't
        // have one yet
        if (!hasSymbol) {
          for (const auto& pair : grid.pointsAdjacent(point)) {
            if (isSymbol(pair.second)) {
              // Symbol found!
              hasSymbol = true;
              break;
            }
          }
        }
      } else {
        // Number over because we found a non-digit
        if (hasSymbol) {
          // A symbol was found during this process
          total += currentNumber;
        }
        // Reset number trackin'
        hasSymbol = false;
        currentNumber = 0;
      }
    }

    // Number over because we went to the next line; same logic as above
    if (hasSymbol) {
      // A symbol was found during this process
      total += currentNumber;
    }
  }

  return total;
}

int partTwo(Grid2D<char> grid) {
  // key: gear location; value: list of part numbers around that gear
  std::map<Point2D, std::vector<int>> gears{};

  Point2D bottomRight = grid.rbegin()->first;
  for (int y = 0; y <= bottomRight.y; y++) {
    int currentNumber = 0;
    bool hasGear = false;
    Point2D gearP{0, 0};
    for (int x = 0; x <= bottomRight.x; x++) {
      Point2D point{x, y};

      // Figure out the new value of currentNumber
      char ch = grid[point];
      if (isDigit(ch)) {
        // Grow the current number
        currentNumber *= 10;
        currentNumber += ch - '0';

        // Check if there is a gear near this point if this number doesn't
        // have one yet
        if (!hasGear) {
          for (const auto& pair : grid.pointsAdjacent(point)) {
            if (pair.second == '*') {
              // Gear found!
              hasGear = true;
              gearP = pair.first;
              break;
            }
          }
        }
      } else {
        // Number over because we found a non-digit
        if (hasGear) {
          // A gear was found during this process
          gears[gearP].push_back(currentNumber);
        }
        // Reset number trackin'
        hasGear = false;
        currentNumber = 0;
      }
    }

    // Number over because we went to the next line; same logic as above
    if (hasGear) {
      // A gear was found during this process
      gears[gearP].push_back(currentNumber);
    }
  }

  // Find all gears that have exactly two adjacent numbers
  int total = 0;
  for (const auto& pair : gears) {
    if (auto parts = pair.second; parts.size() == 2) {
      int gearPower = parts[0] * parts[1];
      total += gearPower;
    }
  }

  return total;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  Grid2D<char> grid = linesToGrid(lines);

  auto start = std::chrono::high_resolution_clock::now();

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
