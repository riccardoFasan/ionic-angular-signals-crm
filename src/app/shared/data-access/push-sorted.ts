import {
  FilterClause,
  ItemsPage,
  SearchCriteria,
  SearchFilters,
  SortOrder,
} from '../utility';

type AdvancedOptions<Entity> = {
  inCustomFilters?: (item: Entity, filters: SearchFilters) => boolean;
  customSort?: (item1: Entity, item2: Entity) => -1 | 0 | 1;
};

export function pushSorted<Entity>(
  item: Entity,
  pages: ItemsPage<Entity>[],
  { filters, sortings, pagination: { pageSize, pageIndex } }: SearchCriteria,
  { inCustomFilters, customSort }: AdvancedOptions<Entity> = {},
): ItemsPage<Entity>[] {
  if (filters) {
    const matchFilters = inCustomFilters
      ? inCustomFilters(item, filters)
      : inFilters(item, filters);
    if (!matchFilters) return pages;
  }

  const items = pages.find((page) => page.pageIndex === pageIndex)?.items;

  if (!items) return [...pages, { pageIndex, items: [item] }];
  if (!items.length)
    return pages.map((p) =>
      p.pageIndex === pageIndex ? { ...p, items: [item] } : p,
    );

  const allItems = [...pages.flatMap((p) => p.items), item];

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

function inFilters<Entity>(
  item: Entity,
  { query, clause }: SearchFilters,
): boolean {
  if (Object.keys(query).length === 0) return true;
  const are = clause === FilterClause.And ? 'every' : 'some';
  return Object.entries(query)[are](([key, value]) => {
    const record = item as Record<string, string | number | boolean | Date>;
    return value === record[key];
  });
}
