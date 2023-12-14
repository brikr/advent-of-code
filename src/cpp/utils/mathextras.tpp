#ifndef MATHEXTRAS_TPP
#define MATHEXTRAS_TPP

#include <mathextras.h>

#include <vector>

template <typename Number>
Number lcm(Number a, Number b) {
  return std::abs(a * b) / gcd(a, b);
}

template <typename Number>
Number lcm(std::vector<Number> vec) {
  Number rval = vec[0];
  for (const auto& n : vec) {
    rval = (n * rval) / gcd(n, rval);
  }
  return rval;
}

template <typename Number>
Number gcd(Number a, Number b) {
  if (b == 0) {
    return a;
  }
  return gcd(b, a % b);
}

template <typename Number>
Number gcd(std::vector<Number> vec) {
  Number rval = vec[0];
  for (const auto& n : vec) {
    rval = gcd(n, rval);

    if (rval == 1) {
      return 1;
    }
  }
  return rval;
}

template <typename Number, class Iterator>
Number sum(Iterator start, Iterator end) {
  Number total = 0;

  for (auto it = start; it != end; it++) {
    total += *it;
  }

  return total;
}

#endif
