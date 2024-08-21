export function isObjectArray<T>(array: T[]): boolean {
  return (
    Array.isArray(array) && array.length > 0 && typeof array[0] === 'object'
  );
}
