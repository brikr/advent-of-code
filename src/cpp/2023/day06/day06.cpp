#include <file.h>
#include <stringextras.h>

#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <vector>

long simulateRace(long timeToHold, long maxTime) {
  return (maxTime - timeToHold) * timeToHold;
}

long partOne(const std::map<long, long> &timeToDistance) {
  long total = 1;
  for (const auto &pair : timeToDistance) {
    long beatenCount = 0;
    for (long i = 0; i <= pair.first; i++) {
      long distance = simulateRace(i, pair.first);
      if (distance > pair.second) {
        beatenCount++;
      }
    }
    total *= beatenCount;
  }
  return total;
}

long partTwo(long time, long distanceRecord) {
  long beatenCount = 0;
  for (long i = 0; i <= time; i++) {
    long distance = simulateRace(i, time);
    if (distance > distanceRecord) {
      beatenCount++;
    }
  }
  return beatenCount;
}

int main() {
  std::vector<std::string> lines = fileLines<std::string>("input.txt");

  auto start = std::chrono::high_resolution_clock::now();

  std::map<long, long> timeToDistance{};
  std::vector<std::string> timeStrs = strSplit(lines[0], " ");
  timeStrs.erase(timeStrs.begin());
  std::vector<std::string> distanceStrs = strSplit(lines[1], " ");
  distanceStrs.erase(distanceStrs.begin());

  for (int i = 0; i < timeStrs.size(); i++) {
    long time = std::stol(timeStrs[i]);
    long distance = std::stol(distanceStrs[i]);
    timeToDistance[time] = distance;
  }

  long p2Time = std::stol(strJoin(timeStrs));
  long p2Distance = std::stol(strJoin(distanceStrs));

  std::cout << "Part 1:\n";
  std::cout << partOne(timeToDistance) << std::endl;
  std::cout << "Part 2:\n";
  std::cout << partTwo(p2Time, p2Distance) << std::endl;

  auto end = std::chrono::high_resolution_clock::now();
  auto duration =
      std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
  std::cout << "Ran in " << duration.count() << "ms" << std::endl;

  return 0;
}
