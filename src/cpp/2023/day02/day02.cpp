#include <file.h>
#include <stringextras.h>

#include <algorithm>
#include <chrono>
#include <iostream>
#include <regex>
#include <string>
#include <vector>

struct Subset {
  int red;
  int green;
  int blue;
};

struct Game {
  int id;
  std::vector<Subset> subsets;
};

int partOne(std::vector<Game>& games) {
  int totalPossible = 0;
  for (const auto& game : games) {
    bool valid = true;
    for (const auto& subset : game.subsets) {
      if (subset.red > 12 || subset.green > 13 || subset.blue > 14) {
        valid = false;
        break;
      }
    }
    if (valid) {
      totalPossible += game.id;
    }
  }
  return totalPossible;
}

int partTwo(std::vector<Game>& games) {
  int totalPower = 0;
  for (const auto& game : games) {
    Subset max{0, 0, 0};
    for (const auto& subset : game.subsets) {
      if (subset.red > max.red) max.red = subset.red;
      if (subset.green > max.green) max.green = subset.green;
      if (subset.blue > max.blue) max.blue = subset.blue;
    }
    int power = max.red * max.green * max.blue;
    totalPower += power;
  }
  return totalPower;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  std::regex gamePattern(R"(Game (\d+): (.*))");
  std::regex drawPattern(R"((\d+) (red|green|blue))");
  std::vector<Game> games{};
  std::transform(
      lines.begin(), lines.end(), std::back_inserter(games),
      [gamePattern, drawPattern](std::string& line) {
        std::smatch gameMatch;
        if (std::regex_search(line, gameMatch, gamePattern)) {
          int id = std::stoi(gameMatch[1].str());
          std::string rest = gameMatch[2].str();

          Game game;
          game.id = id;

          std::vector<std::string> subsetStrs = strSplit(rest, ";");

          for (const auto& subsetStr : subsetStrs) {
            std::vector<std::string> cubeDraws = strSplit(subsetStr, ",");
            Subset subset{0, 0, 0};
            for (const auto& cubeDraw : cubeDraws) {
              std::smatch drawMatch;
              if (std::regex_search(cubeDraw, drawMatch, drawPattern)) {
                int count = std::stoi(drawMatch[1].str());
                if (drawMatch[2].str() == "red") {
                  subset.red = count;
                } else if (drawMatch[2].str() == "green") {
                  subset.green = count;
                } else {
                  subset.blue = count;
                }
              } else {
                throw std::runtime_error("Can't parse cube draw: " + cubeDraw);
              }
            }
            game.subsets.push_back(subset);
          }

          return game;
        } else {
          throw std::runtime_error("No match for line: " + line);
        }
      });

  auto start = std::chrono::high_resolution_clock::now();

  std::cout << "Part 1:\n";
  std::cout << partOne(games) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(games) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
