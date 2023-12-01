#include <file.h>

#include <algorithm>
#include <chrono>
#include <iostream>
#include <regex>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;

int part_one(std::vector<std::string>& lines) {
  int total = 0;
  for (std::string& line : lines) {
    int firstDigit = -1;
    int lastDigit = -1;
    for (char ch : line) {
      if (ch >= '0' && ch <= '9') {
        if (firstDigit == -1) {
          firstDigit = ch - '0';
        }
        lastDigit = ch - '0';
      }
    }

    int number = firstDigit * 10 + lastDigit;
    total += number;
  }

  return total;
}

int part_two(std::vector<std::string>& lines) {
  std::map<std::string, int> wordToDigit = {
      {"one", 1}, {"two", 2},   {"three", 3}, {"four", 4}, {"five", 5},
      {"six", 6}, {"seven", 7}, {"eight", 8}, {"nine", 9}};

  int total = 0;

  for (std::string& line : lines) {
    // Turn all digits into words
    std::string str = line;
    for (const auto& pair : wordToDigit) {
      std::regex search(std::to_string(pair.second));
      std::string replace = pair.first;
      str = std::regex_replace(str, search, replace);
    }

    // Find the earliest digit word
    size_t earliestPos = std::string::npos;
    std::string earliestWord = "";
    for (const auto& pair : wordToDigit) {
      size_t pos = str.find(pair.first);
      if (pos != std::string::npos && pos < earliestPos) {
        earliestPos = pos;
        earliestWord = pair.first;
      }
    }
    if (earliestWord == "") {
      throw std::runtime_error("no digit found");
    }
    int firstDigit = wordToDigit.at(earliestWord);

    // Find the latest digit word
    size_t latestPos = 0;
    std::string latestWord = "";
    for (const auto& pair : wordToDigit) {
      size_t pos = str.rfind(pair.first);
      if (pos != std::string::npos && pos >= latestPos) {
        latestPos = pos;
        latestWord = pair.first;
      }
    }
    if (latestWord == "") {
      throw std::runtime_error("no digit found");
    }
    int lastDigit = wordToDigit.at(latestWord);

    int number = firstDigit * 10 + lastDigit;
    total += number;
  }

  return total;
}

int main() {
  std::vector<std::string> lines = file_lines_str("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::cout << "Part 1:\n";
  std::cout << part_one(lines) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << part_two(lines) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
