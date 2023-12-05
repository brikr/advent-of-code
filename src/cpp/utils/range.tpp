#ifndef RANGE_TPP
#define RANGE_TPP

#include "range.h"

template <typename Number>
bool Range<Number>::contains(Number num) {
  return num >= this->min && num <= this->max;
}

template <typename Number>
bool Range<Number>::overlaps(Range &other) {
  if (this->min <= other.max && this->max >= other.min) {
    return true;
  } else if (other.min <= this->max && other.max >= this->min) {
    return true;
  } else {
    return false;
  }
}

#endif
