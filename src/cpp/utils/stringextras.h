#ifndef STRING_EXTRAS_H
#define STRING_EXTRAS_H

#include <string>
#include <vector>

std::vector<std::string> strSplit(const std::string& str,
                                  const std::string& delimiter);

std::string strJoin(const std::vector<std::string>& vec,
                    const std::string& separator = "");

std::string strReplace(const std::string& original, const std::string& find,
                       const std::string& replace);

#endif
