#include <file.h>
#include <mathextras.h>
#include <stringextras.h>

#include <algorithm>
#include <chrono>
#include <iostream>
#include <map>
#include <stack>
#include <string>
#include <vector>

struct Row {
  std::string springs;
  std::vector<int> groups;
};

// true if the first group in groups can be made in springs starting at idx
bool canSatisfyGroup(const std::string& springs, int groupSize, size_t idx) {
  if (springs[idx] == '.') {
    return false;
  }

  for (int i = idx; i < idx + groupSize; i++) {
    if (i >= springs.length()) {
      // ran out of room
      return false;
    }
    if (springs[i] == '.') {
      // group ended too early
      return false;
    }
  }
  if (springs[idx + groupSize] == '#') {
    // group ended too late
    return false;
  }

  // group was just right
  return true;
}

long findPossibleArrangementsMemo(
    const std::string& springs, const std::vector<int>& groups,
    std::map<std::pair<size_t, size_t>, long>& cache, size_t idx) {
  if (groups.size() == 0) {
    // all groups have been "used up". if any springs remain, this arrangement
    // is impossible
    if (springs.find('#', idx) != std::string::npos) {
      return false;
    }
    // if no springs remain, this arrangement is good
    return true;
  }

  // advance i to the next # or ?
  size_t nextSpring = springs.find('#', idx);
  size_t nextUnknown = springs.find('?', idx);
  size_t nextIdx = std::min(nextSpring, nextUnknown);
  if (nextIdx == std::string::npos) {
    // there are no more springs or possible springs and there are still
    // unformed groups no possible arrangements
    return 0;
  }
  idx = nextIdx;

  // if we already know how many possilbe arrangements there are for this setup,
  // return it
  auto cachedValue = cache.find({idx, groups.size()});
  if (cachedValue != cache.end()) {
    return cachedValue->second;
  }

  long result = 0;

  // if the springs (or ?) starting at idx can be formed into the first group in
  // groups, then advance idx and groups as if we did that and recursively call
  if (canSatisfyGroup(springs, groups[0], idx)) {
    std::vector<int> newGroups(groups.begin() + 1, groups.end());
    result += findPossibleArrangementsMemo(springs, newGroups, cache,
                                           idx + groups[0] + 1);
  }

  // if our current char is ?, then bump idx and recursively call (basically
  // make this ? a .)
  if (springs[idx] == '?') {
    result += findPossibleArrangementsMemo(springs, groups, cache, idx + 1);
  }

  // add the result to the cache
  cache[{idx, groups.size()}] = result;

  return result;
}

long calcTotal(const std::vector<Row>& rows) {
  long total = 0;

  for (const auto& row : rows) {
    std::map<std::pair<size_t, size_t>, long> cache{};
    long arrangements =
        findPossibleArrangementsMemo(row.springs, row.groups, cache, 0);
    total += arrangements;
    // std::cout << row.springs << " - " << arrangements << " Valid States"
    //           << std::endl;
  }

  return total;
}

long partOne(const std::vector<Row>& rows) { return calcTotal(rows); }

long partTwo(const std::vector<Row>& rows) { return calcTotal(rows); }

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::vector<Row> partOneRows;
  std::vector<Row> partTwoRows;
  for (const auto& line : lines) {
    std::vector<std::string> split = strSplit(line, " ");
    std::vector<std::string> groupStrs = strSplit(split[1], ",");

    Row partOneRow{};
    partOneRow.springs = split[0];
    partOneRow.groups = std::vector<int>{};
    for (const auto& str : groupStrs) {
      partOneRow.groups.push_back(std::stoi(str));
    }
    partOneRows.push_back(partOneRow);

    Row partTwoRow{};
    partTwoRow.springs = split[0] + "?" + split[0] + "?" + split[0] + "?" +
                         split[0] + "?" + split[0];
    partTwoRow.groups = std::vector<int>{};
    for (int i = 0; i < 5; i++) {
      for (const auto& g : partOneRow.groups) {
        partTwoRow.groups.push_back(g);
      }
    }
    partTwoRows.push_back(partTwoRow);
  }

  std::cout << "Part 1:\n";
  std::cout << partOne(partOneRows) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(partTwoRows) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
