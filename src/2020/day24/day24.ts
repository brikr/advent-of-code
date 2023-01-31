import {max, min} from 'lodash';
import {fileMapSync} from '../../utils/file';
import {printSolution} from '../../utils/printSolution';

interface Coords {
  x: number;
  y: number;
}

function part1(): number {
  const allTiles = fileMapSync('src/2020/day24/input.txt', line => {
    if (line === '') {
      return;
    }
    const tile: string[] = [];
    const chars = line.split('');
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === 'e') {
        tile.push('e');
      } else if (chars[i] === 'w') {
        tile.push('w');
      } else if (chars[i] === 'n') {
        if (chars[i + 1] === 'e') {
          tile.push('n');
        } else {
          tile.push('n', 'w');
        }
        i++;
      } else if (chars[i] === 's') {
        if (chars[i + 1] === 'e') {
          tile.push('s', 'e');
        } else {
          tile.push('s');
        }
        i++;
      }
    }
    return tile;
  }).filter(Boolean) as string[][];

  const blackTiles = new Set<string>();

  for (const tile of allTiles) {
    let x = 0;
    let y = 0;
    for (const instruction of tile) {
      switch (instruction) {
        case 'n':
          y++;
          break;
        case 'e':
          x++;
          break;
        case 's':
          y--;
          break;
        case 'w':
          x--;
          break;
      }
    }

    const coords = `${x},${y}`;
    if (blackTiles.has(coords)) {
      blackTiles.delete(coords);
    } else {
      blackTiles.add(coords);
    }
  }

  return blackTiles.size;
}

interface Bounds {
  x: {
    min: number;
    max: number;
  };
  y: {
    min: number;
    max: number;
  };
}

class TileArray {
  blackTiles = new Set<string>();

  bounds: Bounds = {
    x: {
      min: 0,
      max: 0,
    },
    y: {
      min: 0,
      max: 0,
    },
  };

  set(x: number, y: number, color: 'black' | 'white') {
    this.bounds.x.min = min([this.bounds.x.min, x])!;
    this.bounds.x.max = max([this.bounds.x.max, x])!;
    this.bounds.y.min = min([this.bounds.y.min, y])!;
    this.bounds.y.max = max([this.bounds.y.max, y])!;

    const coords = `${x},${y}`;
    if (color === 'black') {
      this.blackTiles.add(coords);
    } else {
      this.blackTiles.delete(coords);
    }
  }

  toggle(x: number, y: number) {
    this.bounds.x.min = min([this.bounds.x.min, x])!;
    this.bounds.x.max = max([this.bounds.x.max, x])!;
    this.bounds.y.min = min([this.bounds.y.min, y])!;
    this.bounds.y.max = max([this.bounds.y.max, y])!;

    const coords = `${x},${y}`;

    if (this.blackTiles.has(coords)) {
      this.blackTiles.delete(coords);
    } else {
      this.blackTiles.add(coords);
    }
  }

  isBlack(x: number, y: number) {
    return this.blackTiles.has(`${x},${y}`);
  }

  get numBlack() {
    return this.blackTiles.size;
  }
}

function getNeighbors(tileArray: TileArray, x: number, y: number) {
  let count = 0;
  // E  -> E
  if (tileArray.isBlack(x + 1, y)) {
    count++;
  }
  // SE -> SE
  if (tileArray.isBlack(x + 1, y - 1)) {
    count++;
  }
  // SW -> S
  if (tileArray.isBlack(x, y - 1)) {
    count++;
  }
  // W  -> W
  if (tileArray.isBlack(x - 1, y)) {
    count++;
  }
  // NW -> NW
  if (tileArray.isBlack(x - 1, y + 1)) {
    count++;
  }
  // NE -> N
  if (tileArray.isBlack(x, y + 1)) {
    count++;
  }
  return count;
}

function simulate(tileArray: TileArray): TileArray {
  const tomorrow = new TileArray();
  for (
    let x = tileArray.bounds.x.min - 1;
    x <= tileArray.bounds.x.max + 1;
    x++
  ) {
    for (
      let y = tileArray.bounds.y.min - 1;
      y <= tileArray.bounds.y.max + 1;
      y++
    ) {
      const neighbors = getNeighbors(tileArray, x, y);
      if (tileArray.isBlack(x, y)) {
        if (neighbors === 0 || neighbors > 2) {
          // black to white
          tomorrow.set(x, y, 'white');
        } else {
          tomorrow.set(x, y, 'black');
        }
      } else {
        if (neighbors === 2) {
          // white to black
          tomorrow.set(x, y, 'black');
        } else {
          tomorrow.set(x, y, 'white');
        }
      }
    }
  }
  return tomorrow;
}

function part2(): number {
  const allTiles = fileMapSync('src/2020/day24/input.txt', line => {
    if (line === '') {
      return;
    }
    const tile: string[] = [];
    const chars = line.split('');
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === 'e') {
        tile.push('e');
      } else if (chars[i] === 'w') {
        tile.push('w');
      } else if (chars[i] === 'n') {
        if (chars[i + 1] === 'e') {
          tile.push('n');
        } else {
          tile.push('n', 'w');
        }
        i++;
      } else if (chars[i] === 's') {
        if (chars[i + 1] === 'e') {
          tile.push('s', 'e');
        } else {
          tile.push('s');
        }
        i++;
      }
    }
    return tile;
  }).filter(Boolean) as string[][];

  const tileArray = new TileArray();

  for (const tile of allTiles) {
    let x = 0;
    let y = 0;
    for (const instruction of tile) {
      switch (instruction) {
        case 'n':
          y++;
          break;
        case 'e':
          x++;
          break;
        case 's':
          y--;
          break;
        case 'w':
          x--;
          break;
      }
    }

    tileArray.toggle(x, y);
  }

  let next = tileArray;
  // console.log(0, next.numBlack);
  for (let i = 1; i <= 100; i++) {
    next = simulate(next);
    // console.log(i, next.numBlack);
  }

  return next.numBlack;
}

printSolution(part1(), part2());
