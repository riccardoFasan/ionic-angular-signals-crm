import {
  createSortedItemPages,
  inFilters,
  ItemsPage,
  SearchCriteria,
  SearchFilters,
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

  return createSortedItemPages(allItems, pageSize, sortings, customSort);
}
