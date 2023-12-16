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

  bool contains(Number num) const;
  bool contains(const Range<Number> &other) const;
  bool overlaps(const Range<Number> &other) const;
  bool contiguousWith(const Range<Number> &other) const;
  Range<Number> intersection(const Range<Number> &other) const;
};

template <typename Number>
std::vector<Range<Number>> optimizeRanges(
    const std::vector<Range<Number>> &ranges);

#include "range.tpp"

#endif
