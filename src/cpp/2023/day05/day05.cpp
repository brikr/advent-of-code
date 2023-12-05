#include <file.h>
#include <range.h>
#include <stringextras.h>

#include <chrono>
#include <climits>
#include <iostream>
#include <set>
#include <string>
#include <vector>

struct Mapping {
  long srcStart;
  long destStart;
  long len;
};

struct Input {
  std::set<long> seeds;
  // 0: seed-to-soil, 1: soil-to-fertilizer, ..., 6: humidity-to-location
  std::vector<std::vector<Mapping>> tiers;
};

long findDest(long src, const std::vector<Mapping>& tier) {
  for (const auto& mapping : tier) {
    Range<long> srcRange{mapping.srcStart, mapping.srcStart + mapping.len - 1};
    if (srcRange.contains(src)) {
      long delta = src - mapping.srcStart;
      long dest = mapping.destStart + delta;
      return dest;
    }
    // else: range doesn't include this src, move on
  }
  // no specified ranges have a mapping, which means the default value (src ID)
  // is used
  return src;
}

long partOne(const Input& input) {
  long lowestLocation = LONG_MAX;
  for (const auto& seed : input.seeds) {
    long currentId = seed;  // will become soil ID, fertilizer ID, etc.
    for (const auto& tier : input.tiers) {
      // if currentId is src, find the dest value and update
      currentId = findDest(currentId, tier);
    }
    // currentId is now the location ID
    if (currentId < lowestLocation) {
      lowestLocation = currentId;
    }
  }
  return lowestLocation;
}

long partTwo(const Input& input) {
  // TODO: something to do with culling unused ranges?
  return 0;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  Input input{std::set<long>{}, std::vector<std::vector<Mapping>>{}};

  int section = -1;  // -1=seeds, 0-6=tier indices
  for (const auto& line : lines) {
    if (line == "") {
      section++;
      input.tiers.push_back(std::vector<Mapping>{});
      continue;
    }

    if (section == -1) {
      // reading seeds
      std::string rest = line.substr(7);
      std::vector<std::string> numsVec = strSplit(rest, " ");
      for (const auto& numStr : numsVec) {
        input.seeds.insert(std::stol(numStr));
      }
    } else {
      if (line.find(":") != std::string::npos) {
        // section header; skip this line
        continue;
      }
      // reading tiers
      std::vector<std::string> numsVec = strSplit(line, " ");
      long destStart = std::stol(numsVec[0]);
      long srcStart = std::stol(numsVec[1]);
      long len = std::stol(numsVec[2]);
      input.tiers[section].push_back(Mapping{srcStart, destStart, len});
    }
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
