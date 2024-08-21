import { createSortedItemPages } from './create-sorted-items-pages';
import { ItemsPage } from './items-page.type';
import { SearchCriteria } from './search-criteria.type';

export function removeSorted<Entity, EntityKey>(
  item: Entity,
  pages: ItemsPage<Entity>[],
  { sortings, pagination: { pageSize, pageIndex } }: SearchCriteria,
  extractPk: (item: Entity) => EntityKey,
  customSort?: (item1: Entity, item2: Entity) => -1 | 0 | 1,
): ItemsPage<Entity>[] {
  const items = pages.find((page) => page.pageIndex === pageIndex)?.items;

  if (!items) return [...pages, { pageIndex, items: [item] }];
  if (!items.length)
    return pages.map((p) =>
      p.pageIndex === pageIndex ? { ...p, items: [item] } : p,
    );

  const allItems = pages
    .flatMap((p) => p.items)
    .filter((i) => extractPk(i) !== extractPk(item));

  return createSortedItemPages(allItems, pageSize, sortings, customSort);
}
