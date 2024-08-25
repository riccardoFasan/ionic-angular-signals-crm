export function pushOrReplace<Entity>(
  array: Entity[],
  item: Entity,
  predicate: (item: Entity) => boolean,
): Entity[] {
  const index = array.findIndex(predicate);
  if (index === -1) return [...array, item];
  return array.map((x, i) => (i === index ? item : x));
}
