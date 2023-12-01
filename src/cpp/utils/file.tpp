#ifndef FILE_TPP
#define FILE_TPP

#include <fstream>
#include <iostream>
#include <sstream>

template <typename T>
std::vector<T> file_lines(const std::string& filename) {
  std::ifstream input_file(filename);

  if (!input_file.is_open()) {
    std::cerr << "Could not open file." << std::endl;
    return {};
  }

  std::vector<T> lines{};
  std::string line;
  while (std::getline(input_file, line)) {
    std::istringstream iss(line);
    T casted;
    iss >> casted;
    lines.push_back(casted);
  }

  input_file.close();
  return lines;
}

#endif
