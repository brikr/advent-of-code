export function deleteAll<T>(set: Set<T>, all: Iterable<T>) {
  for (const item of all) {
    set.delete(item);
  }
}

export function onlyItem<T>(set: Set<T>): T {
  if (set.size !== 1) {
    throw new Error(`onlyItem: set contains ${set.size} items`);
  }

  return set.values().next().value;
}
