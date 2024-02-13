import { SearchCriteria, SearchFilters, SortOrder, Sorting } from '../utility';

export function pushSorted<T>(
  item: T,
  items: T[],
  { filters, sortings }: SearchCriteria,
  inCustomFilters?: (item: T, filters: SearchFilters) => boolean,
  getCustomSortedIndex?: (item: T, items: T[], sortings?: Sorting[]) => number,
): T[] {
  if (filters) {
    const matchFilters = inCustomFilters
      ? inCustomFilters(item, filters)
      : inFilters(item, filters);
    if (!matchFilters) return items;
  }

  const sortedIndex =
    getCustomSortedIndex?.(item, items, sortings) ??
    getSortedIndex(item, items, sortings);

  // add item and remove last so pagination is respected
  return items.splice(sortedIndex, items.length, item);
}

function inFilters<T>(item: T, filters: SearchFilters): boolean {
  return Object.entries(filters).every(([key, value]) => {
    const record = item as Record<string, string | number | boolean | Date>;
    return value === record[key];
  });
}

function getSortedIndex<T>(
  item: T,
  items: T[],
  sortings: Sorting[] = [],
): number {
  if (!sortings) return items.length;

  const record = item as Record<string, string | number | boolean | Date>;

  for (let i = 0; i < items.length; i++) {
    const listRecord = items[i] as Record<
      string,
      string | number | boolean | Date
    >;

    if (
      sortings.every(({ property, order }) =>
        order === SortOrder.Ascending
          ? record[property] < listRecord[property]
          : record[property] > listRecord[property],
      )
    ) {
      return i;
    }
  }

  return items.length;
}
