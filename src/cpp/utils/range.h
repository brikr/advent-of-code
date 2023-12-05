#ifndef RANGE_H
#define RANGE_H

template <typename Number>
class Range {
 public:
  Number min;
  Number max;

  Range(Number min, Number max) : min(min), max(max){};

  bool contains(Number num);
  bool overlaps(Range &other);
};

#include "range.tpp"

#endif
