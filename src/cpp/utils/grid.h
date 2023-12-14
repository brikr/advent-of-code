#ifndef GRID_H
#define GRID_H

#include <range.h>

#include <map>
#include <vector>

class Point2D {
 public:
  int x;
  int y;

  Point2D(int x, int y) : x(x), y(y){};

  bool operator==(const Point2D &other) const;
  bool operator!=(const Point2D &other) const;
  Point2D operator+(const Point2D &other) const;
  Point2D operator-(const Point2D &other) const;
  Point2D operator*(int multiplicand) const;
  Point2D operator/(int divisor) const;
  bool operator<(const Point2D &other) const;

  bool isAdjacent(const Point2D &other) const;
  bool isAdjacent(const Point2D &other, bool excludeDiagonals) const;
  int manhattanDistanceFrom(const Point2D &other) const;
};

const Point2D DELTA_UP_LEFT{-1, -1};
const Point2D DELTA_UP{0, -1};
const Point2D DELTA_UP_RIGHT{1, -1};
const Point2D DELTA_LEFT{-1, 0};
const Point2D DELTA_RIGHT{1, 0};
const Point2D DELTA_DOWN_LEFT{-1, 1};
const Point2D DELTA_DOWN{0, 1};
const Point2D DELTA_DOWN_RIGHT{1, 1};

template <typename T>
class Grid2D {
 public:
  bool excludeDiagonals = false;
  Range<int> xBounds{0, 0};
  Range<int> yBounds{0, 0};

  Grid2D();
  Grid2D(bool excludeDiagonals);

  T &operator[](const Point2D &point);
  bool operator==(const Grid2D<T> &other);

  auto at(const Point2D &point) const;
  auto find(const Point2D &point) const;
  auto begin() const;
  auto rbegin() const;
  auto end() const;
  auto size() const;

  std::map<Point2D, T> pointsAdjacent(const Point2D &point) const;
  Grid2D<T> subRegion(Range<int> xBounds, Range<int> yBounds) const;
  std::vector<T> row(int y) const;
  std::vector<T> col(int x) const;
  void print() const;

 private:
  std::map<Point2D, T> map{};
};

Grid2D<char> linesToGrid(const std::vector<std::string> &lines);

#include "grid.tpp"

#endif
