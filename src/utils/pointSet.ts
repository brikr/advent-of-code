import {coordString, Point} from './grid';
import {HashSet} from './hashSet';

export class PointSet extends HashSet<Point> {
  constructor(initialData?: Point[]) {
    super(coordString, initialData);
  }
}
