#include <file.h>
#include <stringextras.h>

#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <vector>

std::map<char, int> cardValuesP1{
    {'2', 2}, {'3', 3},  {'4', 4},  {'5', 5},  {'6', 6},  {'7', 7},  {'8', 8},
    {'9', 9}, {'T', 10}, {'J', 11}, {'Q', 12}, {'K', 13}, {'A', 14},
};
std::map<char, int> cardValuesP2{
    {'2', 2}, {'3', 3},  {'4', 4}, {'5', 5},  {'6', 6},  {'7', 7},  {'8', 8},
    {'9', 9}, {'T', 10}, {'J', 0}, {'Q', 12}, {'K', 13}, {'A', 14},
};

std::map<char, int> handCounts(const std::string &hand) {
  std::map<char, int> counts{};
  for (char c : hand) {
    counts[c]++;
  }
  return counts;
}

bool fiveOfAKind(const std::string &hand) {
  char card = hand[0];
  for (int i = 1; i < hand.length(); i++) {
    if (hand[i] != card) {
      return false;
    }
  }

  return true;
}

bool fourOfAKind(const std::string &hand) {
  std::map<char, int> counts = handCounts(hand);

  for (const auto &pair : counts) {
    if (pair.second == 4) {
      return true;
    }
  }

  return false;
}

bool fullHouse(const std::string &hand) {
  std::map<char, int> counts = handCounts(hand);

  bool hasThree = false;
  bool hasTwo = false;
  for (const auto &pair : counts) {
    if (pair.second == 3) {
      hasThree = true;
    } else if (pair.second == 2) {
      hasTwo = true;
    }
  }

  return hasThree && hasTwo;
}

bool threeOfAKind(const std::string &hand) {
  std::map<char, int> counts = handCounts(hand);

  for (const auto &pair : counts) {
    if (pair.second == 3) {
      return true;
    }
  }

  return false;
}

bool twoPair(const std::string &hand) {
  std::map<char, int> counts = handCounts(hand);

  int pairCount = 0;
  for (const auto &pair : counts) {
    if (pair.second == 2) {
      pairCount++;
    }
  }

  return pairCount == 2;
}

bool onePair(const std::string &hand) {
  std::map<char, int> counts = handCounts(hand);

  for (const auto &pair : counts) {
    if (pair.second == 2) {
      return true;
    }
  }

  return false;
}

int handScore(const std::string &hand) {
  if (fiveOfAKind(hand)) {
    return 6;
  } else if (fourOfAKind(hand)) {
    return 5;
  } else if (fullHouse(hand)) {
    return 4;
  } else if (threeOfAKind(hand)) {
    return 3;
  } else if (twoPair(hand)) {
    return 2;
  } else if (onePair(hand)) {
    return 1;
  } else {
    return 0;
  }
}

std::map<std::string, std::string> optimizedCache{};
std::string optimizeHand(const std::string &hand) {
  if (optimizedCache.count(hand) > 0) {
    return optimizedCache[hand];
  }

  if (hand.find("J") == std::string::npos) {
    // no wildcards, no optimizations to do
    return hand;
  }

  // turn all J's into any card tied for the most occurrences in the hand
  std::map<char, int> counts = handCounts(hand);

  char mostCommonCard;
  int mostCommonCardOccurrences = 0;
  for (const auto &pair : counts) {
    if (pair.first != 'J' && pair.second > mostCommonCardOccurrences) {
      mostCommonCard = pair.first;
      mostCommonCardOccurrences = pair.second;
    }
  }

  std::string optimized = hand;
  optimized = strReplace(optimized, "J", std::string(1, mostCommonCard));

  return optimized;
}

bool compareHands(const std::string &hand1, const std::string &hand2,
                  bool partOne) {
  int hand1Score, hand2Score;
  if (partOne) {
    hand1Score = handScore(hand1);
    hand2Score = handScore(hand2);
  } else {
    std::string hand1Optimized = optimizeHand(hand1);
    std::string hand2Optimized = optimizeHand(hand2);
    hand1Score = handScore(hand1Optimized);
    hand2Score = handScore(hand2Optimized);
  }

  if (hand1Score != hand2Score) {
    return hand1Score > hand2Score;
  }

  std::map<char, int> cardValues = partOne ? cardValuesP1 : cardValuesP2;

  // else: need to compare by cards
  for (int i = 0; i < hand1.length(); i++) {
    int h1Value = cardValues[hand1[i]];
    int h2Value = cardValues[hand2[i]];
    if (h1Value != h2Value) {
      return h1Value > h2Value;
    }
  }

  // shouldn't get here unless we have identical hands, just return anything
  return true;
}

int partOne(const std::vector<std::string> &lines) {
  struct Comparator {
    bool operator()(const std::string &hand1, const std::string &hand2) const {
      return compareHands(hand1, hand2, true);
    }
  };

  std::map<std::string, int, Comparator> handBids{};
  for (const auto &line : lines) {
    std::vector<std::string> split = strSplit(line, " ");
    int bid = std::stoi(split[1]);
    handBids[split[0]] = bid;
  }

  int total = 0;

  int rank = handBids.size();
  for (const auto &pair : handBids) {
    total += pair.second * rank;
    rank--;
  }

  return total;
}

int partTwo(const std::vector<std::string> &lines) {
  struct Comparator {
    bool operator()(const std::string &hand1, const std::string &hand2) const {
      return compareHands(hand1, hand2, false);
    }
  };

  std::map<std::string, int, Comparator> handBids{};
  for (const auto &line : lines) {
    std::vector<std::string> split = strSplit(line, " ");
    int bid = std::stoi(split[1]);
    handBids[split[0]] = bid;
  }

  int total = 0;

  int rank = handBids.size();
  for (const auto &pair : handBids) {
    total += pair.second * rank;
    rank--;
  }

  return total;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::cout << "Part 1:\n";
  std::cout << partOne(lines) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(lines) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
