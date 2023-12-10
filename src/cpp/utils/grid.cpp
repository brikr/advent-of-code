#include <grid.h>

#include <string>
#include <vector>

bool Point2D::isAdjacent(const Point2D &other) const {
  return this->isAdjacent(other, true);
}

bool Point2D::isAdjacent(const Point2D &other, bool excludeDiagonals) const {
  int xDistance = std::abs(other.x - this->x);
  int yDistance = std::abs(other.y - this->y);

  if (excludeDiagonals) {
    return (xDistance <= 1 && yDistance == 0) ||
           (xDistance == 0 && yDistance <= 1);
  } else {
    return xDistance <= 1 && yDistance <= 1;
  }
}

int Point2D::manhattanDistanceFrom(const Point2D &other) const {
  return std::abs(other.x - this->x) + std::abs(other.y - this->y);
}

bool Point2D::operator==(const Point2D &other) const {
  return this->x == other.x && this->y == other.y;
}

bool Point2D::operator!=(const Point2D &other) const {
  return !(*this == other);
}

Point2D Point2D::operator+(const Point2D &other) const {
  return Point2D(this->x + other.x, this->y + other.y);
}

Point2D Point2D::operator-(const Point2D &other) const {
  return Point2D(this->x - other.x, this->y - other.y);
}

Point2D Point2D::operator*(int multiplicand) const {
  return Point2D(this->x * multiplicand, this->y * multiplicand);
}

Point2D Point2D::operator/(int divisor) const {
  return Point2D(this->x / divisor, this->y / divisor);
}

// Only needed to make this efficiently work as a key to std::map. Choosing
// row-major so that iteration matches input files
bool Point2D::operator<(const Point2D &other) const {
  if (this->y == other.y) {
    return this->x < other.x;
  } else {
    return this->y < other.y;
  }
}

Grid2D<char> linesToGrid(std::vector<std::string> &lines) {
  Grid2D<char> grid{};
  for (int y = 0; y < lines.size(); y++) {
    std::string line = lines[y];
    for (int x = 0; x < line.length(); x++) {
      char ch = line[x];
      Point2D point(x, y);
      grid[point] = ch;
    }
  }
  return grid;
}
