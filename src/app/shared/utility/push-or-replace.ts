export function pushOrReplace<T>(
  array: T[],
  item: T,
  predicate: (items: T) => boolean,
): T[] {
  const index = array.findIndex(predicate);
  if (index === -1) return [...array, item];
  return array.map((x, i) => (i === index ? item : x));
}
