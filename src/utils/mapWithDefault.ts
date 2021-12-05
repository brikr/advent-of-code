import {cloneDeep} from 'lodash';

export class MapWithDefault<K, V> extends Map<K, V> {
  def: V;

  constructor(def: V) {
    super();
    this.def = def;
  }

  get(key: K): V {
    return super.get(key) ?? cloneDeep(this.def);
  }
}
