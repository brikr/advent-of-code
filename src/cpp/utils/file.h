#ifndef FILE_H
#define FILE_H

#include <string>
#include <vector>

template <typename T>
std::vector<T> file_lines(const std::string& filename);

#include "file.tpp"

#endif
