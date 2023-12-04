#include <file.h>
#include <stringextras.h>

#include <chrono>
#include <cmath>
#include <iostream>
#include <regex>
#include <set>
#include <string>
#include <vector>

struct Card {
  int number;
  std::set<int> winners;
  std::set<int> have;
};

int partOne(std::vector<Card>& cards) {
  int total = 0;

  for (const auto& card : cards) {
    int winnerCount = 0;
    for (const auto& held : card.have) {
      if (card.winners.count(held) > 0) {
        winnerCount++;
      }
    }
    if (winnerCount > 0) {
      total += std::pow(2, winnerCount - 1);
    }
  }

  return total;
}

int partTwo(std::vector<Card>& cards) {
  std::map<int, int> cardCounts;

  for (const auto& card : cards) {
    // always count the card we got for free
    cardCounts[card.number]++;

    // how many winners?
    int winnerCount = 0;
    for (const auto& held : card.have) {
      if (card.winners.count(held) > 0) {
        winnerCount++;
      }
    }

    // for each winning number, find the next card and give it as many copies as
    // we had of this card
    for (int i = 1; i <= winnerCount; i++) {
      cardCounts[card.number + i] += cardCounts[card.number];
    }
  }

  // total em up
  int total = 0;
  for (const auto& pair : cardCounts) {
    total += pair.second;
  }

  return total;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  std::vector<Card> cards{};
  for (const auto& line : lines) {
    std::vector<std::string> split = strSplit(line, ':');

    int cardNumber = std::stoi(strSplit(split[0], ' ').back());
    std::vector<std::string> numberSets = strSplit(split[1], '|');
    std::vector<std::string> winningNumberStrs = strSplit(numberSets[0], ' ');
    std::vector<std::string> heldNumberStrs = strSplit(numberSets[1], ' ');

    std::set<int> winners{};
    for (const auto& numOrBlank : winningNumberStrs) {
      if (numOrBlank != "") {
        winners.insert(std::stoi(numOrBlank));
      }
    }

    std::set<int> have{};
    for (const auto& numOrBlank : heldNumberStrs) {
      if (numOrBlank != "") {
        have.insert(std::stoi(numOrBlank));
      }
    }

    cards.push_back(Card{cardNumber, winners, have});
  }

  auto start = std::chrono::high_resolution_clock::now();

  std::cout << "Part 1:\n";
  std::cout << partOne(cards) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(cards) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
