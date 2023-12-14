#ifndef MATHEXTRAS_H
#define MATHEXTRAS_H

template <typename Number>
Number lcm(Number a, Number b);
template <typename Number>
Number lcm(std::vector<Number> vec);
template <typename Number>
Number gcd(Number a, Number b);
template <typename Number>
Number gcd(std::vector<Number> vec);
template <typename Number, class Iterator>
Number sum(Iterator start, Iterator end);

#include "mathextras.tpp"

#endif
