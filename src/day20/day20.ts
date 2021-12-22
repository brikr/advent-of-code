import {cloneDeep, inRange, times} from 'lodash';
import {fileLines} from '../utils/file';
import {printSolution} from '../utils/printSolution';

interface Range {
  min: number;
  max: number;
}

interface Area {
  x: Range;
  y: Range;
}

interface Point2D {
  x: number;
  y: number;
}

interface Image {
  lightPixels: Set<string>;
  area: Area;
  // whether the "infinite sea" of pixels is on or off
  background: boolean;
}

function pointToString({x, y}: Point2D): string {
  return `${x},${y}`;
}

function pointsAround({x, y}: Point2D): Point2D[] {
  return [
    // top left
    {
      x: x - 1,
      y: y - 1,
    },
    // top middle
    {
      x,
      y: y - 1,
    },
    // top right
    {
      x: x + 1,
      y: y - 1,
    },
    // left
    {
      x: x - 1,
      y,
    },
    // self
    {
      x,
      y,
    },
    // right
    {
      x: x + 1,
      y,
    },
    // bottom left
    {
      x: x - 1,
      y: y + 1,
    },
    // bottom middle
    {
      x,
      y: y + 1,
    },
    // bottom right
    {
      x: x + 1,
      y: y + 1,
    },
  ];
}

function isInsideArea(p: Point2D, area: Area): boolean {
  return (
    inRange(p.x, area.x.min, area.x.max + 1) &&
    inRange(p.y, area.y.min, area.y.max + 1)
  );
}

function oneSmallerArea(area: Area): Area {
  return {
    x: {
      min: area.x.min + 1,
      max: area.x.max - 1,
    },
    y: {
      min: area.y.min + 1,
      max: area.y.max - 1,
    },
  };
}

function enhance(image: Image, algorithm: boolean[]): Image {
  const newImage: Image = {
    lightPixels: new Set<string>(),
    area: cloneDeep(image.area),
    background: image.background,
  };
  for (let y = image.area.y.min; y <= image.area.y.max; y++) {
    for (let x = image.area.x.min; x <= image.area.x.max; x++) {
      const nineByNine = pointsAround({x, y});
      let binaryString = '';
      for (const p of nineByNine) {
        let lit = image.lightPixels.has(pointToString(p));
        if (!isInsideArea(p, oneSmallerArea(image.area))) {
          // this pixel is outside the image's range. it's lit value is the value of the image's background
          lit = image.background;
        }
        if (lit) {
          binaryString += '1';
        } else {
          binaryString += '0';
        }
      }
      const binary = parseInt(binaryString, 2);
      if (algorithm[binary]) {
        // console.log('setting', pointToString({x, y}), 'to light');
        newImage.lightPixels.add(pointToString({x, y}));

        // expand the area to make sure it includes the pixels around this new one
        newImage.area.x.min = Math.min(x - 1, newImage.area.x.min);
        newImage.area.x.max = Math.max(x + 1, newImage.area.x.max);
        newImage.area.y.min = Math.min(y - 1, newImage.area.y.min);
        newImage.area.y.max = Math.max(y + 1, newImage.area.y.max);
      }
    }
  }

  // set the new background value
  newImage.background = image.background ? algorithm[511] : algorithm[0];

  return newImage;
}

function getArea(lightPixels: Set<string>): Area {
  const area = {
    x: {
      min: 0,
      max: 0,
    },
    y: {
      min: 0,
      max: 0,
    },
  };
  for (const pixel of lightPixels) {
    const [x, y] = pixel.split(',').map(Number);
    area.x.min = Math.min(x, area.x.min);
    area.x.max = Math.max(x, area.x.max);
    area.y.min = Math.min(y, area.y.min);
    area.y.max = Math.max(y, area.y.max);
  }

  area.x.min--;
  area.x.max++;
  area.y.min--;
  area.y.max++;

  return area;
}

function part1(image: Image, algorithm: boolean[]): number {
  const area = {
    x: {
      min: 0,
      max: 0,
    },
    y: {
      min: 0,
      max: 0,
    },
  };
  for (const pixel of image.lightPixels) {
    const [x, y] = pixel.split(',').map(Number);
    area.x.min = Math.min(x, area.x.min);
    area.x.max = Math.max(x, area.x.max);
    area.y.min = Math.min(y, area.y.min);
    area.y.max = Math.max(y, area.y.max);
  }

  // console.log(image.lightPixels.size, image.area, image.background);
  image = enhance(image, algorithm);
  // console.log(image.lightPixels.size, image.area, image.background);
  image = enhance(image, algorithm);
  // console.log(image.lightPixels.size, image.area, image.background);

  return image.lightPixels.size;
}

function part2(image: Image, algorithm: boolean[]): number {
  const area = {
    x: {
      min: 0,
      max: 0,
    },
    y: {
      min: 0,
      max: 0,
    },
  };
  for (const pixel of image.lightPixels) {
    const [x, y] = pixel.split(',').map(Number);
    area.x.min = Math.min(x, area.x.min);
    area.x.max = Math.max(x, area.x.max);
    area.y.min = Math.min(y, area.y.min);
    area.y.max = Math.max(y, area.y.max);
  }

  times(50, step => {
    image = enhance(image, algorithm);
    // console.log(`after ${step + 1} enhances:`);
    // console.log(image.lightPixels.size, image.area, image.background);
  });

  return image.lightPixels.size;
}

const lines = fileLines('src/day20/input.txt');

const algorithm = lines[0].split('').map(c => c === '#');

// key: coordinates as x,y string
// if a pixel isn't in here, it's dark
const ogLightPixels = new Set<string>();
for (const [y, row] of lines.slice(2).entries()) {
  for (const [x, char] of row.split('').entries()) {
    if (char === '#') {
      ogLightPixels.add(`${x},${y}`);
    }
  }
}

const ogArea = getArea(ogLightPixels);

const input: Image = {
  lightPixels: ogLightPixels,
  area: ogArea,
  background: false,
};

printSolution(part1(input, algorithm), part2(input, algorithm));
