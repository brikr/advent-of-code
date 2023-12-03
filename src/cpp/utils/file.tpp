#ifndef FILE_TPP
#define FILE_TPP

#include <fstream>
#include <iostream>
#include <sstream>

#include "file.h"

template <typename T>
T strToTemplate(const std::string& str) {
  std::stringstream ss(str);
  T casted;
  ss >> casted;
  return casted;
}

template <>
std::string strToTemplate<std::string>(const std::string& str) {
  return str;
}

template <typename T>
std::vector<T> fileLines(const std::string& filename) {
  std::ifstream input_file(filename);

  if (!input_file.is_open()) {
    std::cerr << "Could not open file." << std::endl;
    return {};
  }

  std::vector<T> lines{};
  std::string line;
  while (std::getline(input_file, line)) {
    T casted = strToTemplate<T>(line);
    lines.push_back(casted);
  }

  input_file.close();
  return lines;
}

#endif
