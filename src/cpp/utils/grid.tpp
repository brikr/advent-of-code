#ifndef GRID_TPP
#define GRID_TPP

#include <range.h>

#include <algorithm>
#include <iostream>
#include <map>
#include <vector>

#include "grid.h"

template <typename T>
Grid2D<T>::Grid2D() {}

template <typename T>
Grid2D<T>::Grid2D(bool excludeDiagonals) {
  this->excludeDiagonals = excludeDiagonals;
  this->map = std::map<Point2D, T>{};
}

template <typename T>
Grid2D<T> Grid2D<T>::operator=(const Grid2D<T> &other) {
  this->map.clear();
  this->excludeDiagonals = other.excludeDiagonals;

  for (int y = other.yBounds.min; y <= other.yBounds.max; y++) {
    for (int x = other.xBounds.min; x <= other.xBounds.max; x++) {
      this->map[{x, y}] = other.at({x, y});
    }
  }

  return *this;
}

template <typename T>
T &Grid2D<T>::operator[](const Point2D &point) {
  if (this->size() == 0) {
    this->xBounds.min = point.x;
    this->xBounds.max = point.x;
    this->yBounds.min = point.y;
    this->yBounds.max = point.y;
  } else {
    this->xBounds.min = std::min(this->xBounds.min, point.x);
    this->xBounds.max = std::max(this->xBounds.max, point.x);
    this->yBounds.min = std::min(this->yBounds.min, point.y);
    this->yBounds.max = std::max(this->yBounds.max, point.y);
  }

  return this->map[point];
}

template <typename T>
bool Grid2D<T>::operator==(const Grid2D<T> &other) const {
  if (this->size() != other.size()) {
    return false;
  }

  for (const auto &pair : *this) {
    auto it = other.find(pair.first);
    if (it == other.end()) {
      return false;
    }

    if (it->second != pair.second) {
      return false;
    }
  }

  return true;
}

template <typename T>
auto Grid2D<T>::at(const Point2D &point) const {
  return this->map.at(point);
}

template <typename T>
auto Grid2D<T>::find(const Point2D &point) const {
  return this->map.find(point);
}

template <typename T>
auto Grid2D<T>::begin() const {
  return this->map.begin();
}

template <typename T>
auto Grid2D<T>::rbegin() const {
  return this->map.rbegin();
}

template <typename T>
auto Grid2D<T>::end() const {
  return this->map.end();
}

template <typename T>
auto Grid2D<T>::size() const {
  return this->map.size();
}

template <typename T>
std::map<Point2D, T> Grid2D<T>::pointsAdjacent(const Point2D &point) const {
  std::map<Point2D, T> adjacent{};

  std::vector<Point2D> deltas{DELTA_UP, DELTA_LEFT, DELTA_RIGHT, DELTA_DOWN};
  if (!this->excludeDiagonals) {
    deltas.insert(deltas.end(), {DELTA_UP_LEFT, DELTA_UP_RIGHT, DELTA_DOWN_LEFT,
                                 DELTA_DOWN_RIGHT});
  }

  for (const auto &delta : deltas) {
    Point2D other = point + delta;
    if (auto found = this->map.find(other); found != this->map.end()) {
      adjacent[other] = found->second;
    }
  }

  return adjacent;
}

template <typename T>
Grid2D<T> Grid2D<T>::subRegion(Range<int> xBounds, Range<int> yBounds) const {
  Grid2D<T> newGrid{};
  newGrid.excludeDiagonals = this->excludeDiagonals;

  for (int y = yBounds.min; y <= yBounds.max; y++) {
    for (int x = xBounds.min; x <= xBounds.max; x++) {
      newGrid[{x, y}] = this->at({x, y});
    }
  }

  return newGrid;
}

template <typename T>
std::vector<T> Grid2D<T>::row(int y) const {
  std::vector<T> vec{};
  for (int x = this->xBounds.min; x <= this->xBounds.max; x++) {
    vec.push_back(this->at({x, y}));
  }
  return vec;
}

template <typename T>
std::vector<T> Grid2D<T>::col(int x) const {
  std::vector<T> vec{};
  for (int y = this->yBounds.min; y <= this->yBounds.max; y++) {
    vec.push_back(this->at({x, y}));
  }
  return vec;
}

template <typename T>
void Grid2D<T>::print() const {
  int currentY = this->map.begin()->first.y;
  for (const auto &pair : this->map) {
    if (pair.first.y != currentY) {
      std::cout << std::endl;
      currentY = pair.first.y;
    }

    std::cout << pair.second;
  }
  std::cout << std::endl;
}

#endif
