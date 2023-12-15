#include <file.h>
#include <stringextras.h>

#include <chrono>
#include <iostream>
#include <list>
#include <string>
#include <vector>

int calculateHash(const std::string& string) {
  int currentValue = 0;
  for (char c : string) {
    currentValue += c;
    currentValue *= 17;
    currentValue %= 256;
  }
  return currentValue;
}

int partOne(const std::vector<std::string>& strings) {
  int sum = 0;

  for (const auto& string : strings) {
    sum += calculateHash(string);
  }

  return sum;
}

struct Lens {
  std::string label;
  int focalLength;
};

struct Box {
  std::list<Lens> lenses;
};

int partTwo(const std::vector<std::string>& steps) {
  std::vector<Box> boxes{};
  boxes.resize(256);

  for (const auto& step : steps) {
    if (size_t pos = step.find('='); pos != std::string::npos) {
      // equals operator
      std::string label = step.substr(0, pos);
      int focalLength = std::stoi(step.substr(pos + 1));

      // insert/replace lens with focal length
      int hash = calculateHash(label);
      bool replaced = false;
      auto it = boxes[hash].lenses.begin();
      while (it != boxes[hash].lenses.end()) {
        if (it->label == label) {
          // replace focalLength
          it->focalLength = focalLength;
          replaced = true;
          break;
        } else {
          it++;
        }
      }

      if (!replaced) {
        // no existing lens with label, append to back
        boxes[hash].lenses.push_back({label, focalLength});
      }
    } else {
      // dash operator
      std::string label = step.substr(0, step.length() - 1);

      // remove all lenses with this label
      int hash = calculateHash(label);
      auto it = boxes[hash].lenses.begin();
      while (it != boxes[hash].lenses.end()) {
        if (it->label == label) {
          it = boxes[hash].lenses.erase(it);
        } else {
          it++;
        }
      }
    }
  }

  int focusingPower = 0;

  int boxNumber = 1;
  for (auto boxIt = boxes.begin(); boxIt != boxes.end(); boxIt++, boxNumber++) {
    int lensNumber = 1;
    for (auto lensIt = boxIt->lenses.begin(); lensIt != boxIt->lenses.end();
         lensIt++, lensNumber++) {
      focusingPower += boxNumber * lensNumber * lensIt->focalLength;
    }
  }

  return focusingPower;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::vector<std::string> strings = strSplit(lines[0], ",");

  std::cout << "Part 1:\n";
  std::cout << partOne(strings) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(strings) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
