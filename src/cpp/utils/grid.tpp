#ifndef GRID_TPP
#define GRID_TPP

#include <map>
#include <vector>

#include "grid.h"

template <typename T>
Grid2D<T>::Grid2D() {
  this->excludeDiagonals = false;
  this->map = std::map<Point2D, T>{};
}

template <typename T>
Grid2D<T>::Grid2D(bool excludeDiagonals) {
  this->excludeDiagonals = excludeDiagonals;
  this->map = std::map<Point2D, T>{};
}

template <typename T>
T Grid2D<T>::operator[](const Point2D &index) const {
  return this->map[index];
}

template <typename T>
T &Grid2D<T>::operator[](const Point2D &index) {
  return this->map[index];
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

#endif
