#ifndef RANGE_H
#define RANGE_H

#include <vector>

template <typename Number>
class Range {
 public:
  Number min;
  Number max;

  Range() : min(0), max(0){};
  Range(Number min, Number max) : min(min), max(max){};

  bool contains(Number num);
  bool contains(const Range<Number> &other);
  bool overlaps(const Range<Number> &other);
  bool contiguousWith(const Range<Number> &other);
  Range<Number> intersection(const Range<Number> &other);
};

template <typename Number>
std::vector<Range<Number>> optimizeRanges(
    const std::vector<Range<Number>> &ranges);

#include "range.tpp"

#endif
