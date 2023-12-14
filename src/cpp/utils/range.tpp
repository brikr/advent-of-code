#ifndef RANGE_TPP
#define RANGE_TPP

#include <algorithm>
#include <vector>

#include "range.h"

template <typename Number>
bool Range<Number>::contains(Number num) {
  return num >= this->min && num <= this->max;
}

template <typename Number>
bool Range<Number>::contains(const Range<Number> &other) {
  return this->min <= other.min && this->max >= other.max;
}

template <typename Number>
bool Range<Number>::overlaps(const Range<Number> &other) {
  if (this->min <= other.max && this->max >= other.min) {
    return true;
  } else if (other.min <= this->max && other.max >= this->min) {
    return true;
  } else {
    return false;
  }
}

template <typename Number>
bool Range<Number>::contiguousWith(const Range<Number> &other) {
  return this->min == other.max + 1 || this->max == other.min - 1;
}

template <typename Number>
Range<Number> Range<Number>::intersection(const Range<Number> &other) {
  Number min, max;
  min = std::max(this->min, other.min);
  max = std::min(this->max, other.max);
  if (min > max) {
    throw std::runtime_error("Ranges do not overlap.");
  }
  return Range<Number>{min, max};
}

template <typename Number>
std::vector<Range<Number>> optimizeRanges(
    const std::vector<Range<Number>> &ranges) {
  std::vector<Range<Number>> sorted(ranges.begin(), ranges.end());
  std::sort(sorted.begin(), sorted.end(),
            [](auto &a, auto &b) { return a.min < b.min; });

  std::vector<Range<Number>> optimized{};

  Range<Number> current = sorted[0];
  int idx = 1;
  while (idx < sorted.size()) {
    if (current.contains(sorted[idx])) {
      // already accounted for, keep going (no-op)
    } else if (current.overlaps(sorted[idx]) ||
               current.contiguousWith(sorted[idx])) {
      // expand current range and keep going
      current.max = sorted[idx].max;
    } else {
      // this range is over
      optimized.push_back(current);
      current = sorted[idx];
    }
    idx++;
  }
  optimized.push_back(current);

  return optimized;
}

#endif
