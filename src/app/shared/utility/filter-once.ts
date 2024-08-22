export function filterOnce<T>(
  array: T[],
  predicate: (value: T) => boolean,
): T[] {
  const index = array.findIndex(predicate);
  if (index === -1) return array;
  return [...array.slice(0, index), ...array.slice(index + 1)];
}
