import { SearchCriteria, SearchFilters, SortOrder, Sorting } from '../utility';

export function pushSorted<T>(
  item: T,
  items: T[],
  { filters, sorting }: SearchCriteria,
  inCustomFilters?: (item: T, filters: SearchFilters) => boolean,
  getCustomSortedIndex?: (item: T, items: T[], sorting?: Sorting) => number,
): T[] {
  if (filters) {
    const matchFilters = inCustomFilters
      ? inCustomFilters(item, filters)
      : inFilters(item, filters);
    if (!matchFilters) return items;
  }

  const sortedIndex =
    getCustomSortedIndex?.(item, items, sorting) ??
    getSortedIndex(item, items, sorting);

  // add item and remove last so pagination is respected
  return items.splice(sortedIndex, items.length, item);
}

function inFilters<T>(item: T, filters: SearchFilters): boolean {
  return Object.entries(filters).every(([key, value]) => {
    const record = item as Record<string, string | number | boolean | Date>;
    return value === record[key];
  });
}

function getSortedIndex<T>(item: T, items: T[], sorting?: Sorting): number {
  if (!sorting) return items.length;

  const { property, order } = sorting;
  const record = item as Record<string, string | number | boolean | Date>;

  for (let i = 0; i < items.length; i++) {
    const listRecord = items[i] as Record<
      string,
      string | number | boolean | Date
    >;

    if (
      order === SortOrder.Ascending &&
      record[property] < listRecord[property]
    ) {
      return i;
    }

    if (
      order === SortOrder.Descending &&
      record[property] > listRecord[property]
    ) {
      return i;
    }
  }

  return items.length;
}
