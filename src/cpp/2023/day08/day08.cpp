#include <file.h>
#include <mathextras.h>

#include <chrono>
#include <iostream>
#include <map>
#include <numeric>
#include <regex>
#include <set>
#include <string>
#include <vector>

struct Node {
  std::string left;
  std::string right;
};

struct Input {
  std::string directions;
  std::map<std::string, Node> nodes;
};

bool isEnd(const std::string& node, bool partOne) {
  if (partOne) {
    return node == "ZZZ";
  } else {
    return node[2] == 'Z';
  }
}

int countSteps(const std::string& start, const Input& input, bool partOne) {
  std::string curr = start;
  int steps = 0;
  while (!isEnd(curr, partOne)) {
    Node node = input.nodes.at(curr);

    int idx = steps % input.directions.length();
    char dir = input.directions[idx];

    if (dir == 'L') {
      curr = node.left;
    } else {
      curr = node.right;
    }
    steps++;
  }
  return steps;
}

int partOne(const Input& input) { return countSteps("AAA", input, true); }

long partTwo(const Input& input) {
  std::vector<std::string> startingNodes{};

  // populate starting spaces
  for (const auto& pair : input.nodes) {
    if (pair.first[2] == 'A') {
      startingNodes.push_back(pair.first);
    }
  }

  std::vector<long> allSteps{};

  for (const auto& start : startingNodes) {
    long steps = (long)countSteps(start, input, false);
    allSteps.push_back(steps);
  }

  return lcm<long>(allSteps);
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  Input input;
  input.directions = lines[0];

  std::regex nodePattern(R"((...) = \((...), (...)\))");
  for (auto it = lines.begin() + 2; it != lines.end(); it++) {
    std::string line = *it;

    std::smatch nodeMatch;
    std::regex_match(line, nodeMatch, nodePattern);

    std::string from = nodeMatch[1].str();
    std::string left = nodeMatch[2].str();
    std::string right = nodeMatch[3].str();

    Node node{left, right};
    input.nodes[from] = node;
  }

  std::cout << "Part 1:\n";
  std::cout << partOne(input) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(input) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
