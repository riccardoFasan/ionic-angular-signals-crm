import { createSortedItemPages } from './create-sorted-items-pages';
import { inFilters } from './in-filters';
import { ItemsPage } from './items-page.type';
import { SearchCriteria } from './search-criteria.type';
import { SearchFilters } from './search-filters.type';

type AdvancedOptions<Entity> = {
  inCustomFilters?: (item: Entity, filters: SearchFilters) => boolean;
  customSort?: (item1: Entity, item2: Entity) => -1 | 0 | 1;
};

export function updateSorted<Entity, EntityKey>(
  updatedItem: Entity,
  pages: ItemsPage<Entity>[],
  { filters, sortings, pagination: { pageSize } }: SearchCriteria,
  extractPk: (item: Entity) => EntityKey,
  { inCustomFilters, customSort }: AdvancedOptions<Entity> = {},
): ItemsPage<Entity>[] {
  if (filters) {
    const matchFilters = inCustomFilters
      ? inCustomFilters(updatedItem, filters)
      : inFilters(updatedItem, filters);
    if (!matchFilters) return pages;
  }

  const allItems = pages
    .flatMap((p) => p.items)
    .map((item) =>
      extractPk(item) === extractPk(updatedItem) ? updatedItem : item,
    );

  return createSortedItemPages(allItems, pageSize, sortings, customSort);
}
