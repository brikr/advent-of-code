#include <sstream>
#include <string>
#include <vector>

std::vector<std::string> strSplit(const std::string& str, char delimiter) {
  std::vector<std::string> tokens;
  std::istringstream tokenStream(str);
  std::string token;

  while (std::getline(tokenStream, token, delimiter)) {
    tokens.push_back(token);
  }

  return tokens;
}
