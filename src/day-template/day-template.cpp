#include <file.h>

#include <chrono>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

int part_one(std::vector<std::string> lines) { return 0; }

int part_two(std::vector<std::string> lines) { return 0; }

int main() {
  std::vector<std::string> lines = file_lines<std::string>("input.txt");

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
