import { areEqualObjects } from './are-equal-objects';

export function objectArrayUnique<T>(
  array: T[],
  predicate: (item1: T, item2: T) => boolean = areEqualObjects,
): T[] {
  return array.filter(
    (value, index, array) =>
      array.findIndex((item) => predicate(item, value)) === index,
  );
}
