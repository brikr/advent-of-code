#include <iostream>
#include <fstream>
#include <string>
#include <vector>

std::vector<std::string> file_lines_str(std::string filename)
{
  std::ifstream input_file(filename);

  if (!input_file.is_open())
  {
    std::cerr << "Could not open file." << std::endl;
    return {};
  }

  std::vector<std::string> lines{};
  std::string line;
  while (std::getline(input_file, line))
  {
    lines.push_back(line);
  }

  input_file.close();
  return lines;
}

std::vector<int> file_lines_int(std::string filename)
{
  std::vector<int> lines_int;
  std::vector<std::string> lines_str;

  for (const std::string &line : lines_str)
  {
    lines_int.push_back(std::stoi(line));
  }

  return lines_int;
}

std::vector<long> file_lines_long(std::string filename)
{
  std::vector<long> lines_long;
  std::vector<std::string> lines_str;

  for (const std::string &line : lines_str)
  {
    lines_long.push_back(stol(line));
  }

  return lines_long;
}
