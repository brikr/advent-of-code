#include <file.h>
#include <stringextras.h>

#include <chrono>
#include <iostream>
#include <string>
#include <vector>

std::pair<long, long> findNext(const std::vector<long>& seq) {
  std::vector<std::vector<long>> layers{seq};

  // build the pyramid until bottom layer is all zeroes
  bool allZeroes = false;
  while (allZeroes == false) {
    std::vector<long> lastLayer = layers.back();
    std::vector<long> nextLayer{};
    allZeroes = true;
    for (auto it = lastLayer.begin() + 1; it != lastLayer.end(); it++) {
      long a = *(it - 1);
      long b = *it;
      long diff(b - a);
      nextLayer.push_back(diff);
      if (diff != 0) {
        allZeroes = false;
      }
    }
    layers.push_back(nextLayer);
  }

  // add up the last value of each layer for the next value
  long next = 0;
  for (const auto& layer : layers) {
    next += layer.back();
  }

  // prev value: go up the layers, subtracting current running value from the
  // beginning of current layer
  long prev = 0;
  for (auto it = layers.rbegin() + 1; it != layers.rend(); it++) {
    prev = (*it).front() - prev;
  }

  return std::make_pair(prev, next);
}

long partOne(const std::vector<std::vector<long>>& sequences) {
  long total = 0;

  for (const auto& seq : sequences) {
    total += findNext(seq).second;
  }

  return total;
}

long partTwo(const std::vector<std::vector<long>>& sequences) {
  long total = 0;

  for (const auto& seq : sequences) {
    total += findNext(seq).first;
  }

  return total;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::vector<std::vector<long>> sequences{};
  for (const auto& line : lines) {
    std::vector<std::string> nums = strSplit(line, " ");
    std::vector<long> sequence{};
    for (const auto& str : nums) {
      sequence.push_back(std::stoi(str));
    }
    sequences.push_back(sequence);
  }

  std::cout << "Part 1:\n";
  std::cout << partOne(sequences) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(sequences) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
