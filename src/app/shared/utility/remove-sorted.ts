import { ItemsPage } from './items-page.type';
import { SearchCriteria } from './search-criteria.type';
import { SortOrder } from './sort-order.enum';

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

  const sortedItems = allItems.sort((a, b) => {
    if (customSort) return customSort(a, b);

    const aRecord = a as Record<string, string | number | boolean | Date>;
    const bRecord = b as Record<string, string | number | boolean | Date>;

    return sortings?.every(({ property, order }) =>
      order === SortOrder.Ascending
        ? aRecord[property] < bRecord[property]
        : aRecord[property] > bRecord[property],
    )
      ? -1
      : 1;
  });

  return sortedItems.reduce<ItemsPage<Entity>[]>(
    (pages, item) => {
      const lastPage = pages[pages.length - 1];

      if (lastPage.items.length < pageSize) {
        return pages.map((p) =>
          p.pageIndex === lastPage.pageIndex
            ? { ...p, items: [...p.items, item] }
            : p,
        );
      }

      return [...pages, { pageIndex: lastPage.pageIndex + 1, items: [item] }];
    },
    [{ pageIndex: 0, items: [] }],
  );
}
