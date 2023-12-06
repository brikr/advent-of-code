#include <stringextras.h>

#include <sstream>
#include <string>
#include <vector>

std::vector<std::string> strSplit(const std::string& str,
                                  const std::string& delimiter) {
  std::vector<std::string> tokens;

  size_t delimLength = delimiter.length();

  size_t lastPos = 0;
  size_t pos = 0;
  while (pos != std::string::npos) {
    // find the next instance of the delimiter
    pos = str.find(delimiter, lastPos);
    // construct substr args from right after last delimiter to next delimeter
    // (or end of string)
    size_t len = pos == std::string::npos ? std::string::npos : pos - lastPos;
    std::string sub = str.substr(lastPos, len);
    if (sub.length() > 0) {
      // omit empty sections (multiple delimeters in a row count as one)
      tokens.push_back(sub);
    }
    lastPos = pos + delimLength;
  }

  return tokens;
}

std::string strJoin(const std::vector<std::string>& vec,
                    const std::string& separator) {
  std::ostringstream oss;

  for (int i = 0; i < vec.size(); i++) {
    oss << vec[i];
    if (i != vec.size() - 1) {
      oss << separator;
    }
  }

  return oss.str();
}
