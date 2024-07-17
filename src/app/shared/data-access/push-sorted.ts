import {
  ItemsPage,
  SearchCriteria,
  SearchFilters,
  SortOrder,
  Sorting,
} from '../utility';

export function pushSorted<T>(
  item: T,
  pages: ItemsPage<T>[],
  { filters, sortings, pagination }: SearchCriteria,
  inCustomFilters?: (item: T, filters: SearchFilters) => boolean,
  getCustomSortedIndex?: (item: T, items: T[], sortings?: Sorting[]) => number,
): ItemsPage<T>[] {
  if (filters) {
    const matchFilters = inCustomFilters
      ? inCustomFilters(item, filters)
      : inFilters(item, filters);
    if (!matchFilters) return pages;
  }

  const { pageSize, pageIndex } = pagination;

  const items = pages.find((page) => page.pageIndex === pageIndex)?.items;

  if (!items) return [...pages, { pageIndex, items: [item] }];

  // the main idea is to insert the new item in its page.items and move the last, if present,
  // to the next page and if the next page is full, move the last to the next page and so on

  const sortedIndex =
    getCustomSortedIndex?.(item, items, sortings) ??
    getSortedIndex(item, items, sortings);

  const page = {
    pageIndex,
    items: items.splice(sortedIndex, pageSize, item),
  };

  pages = pages.map((p) => (p.pageIndex === pageIndex ? page : p));

  const lastItem = items[pageSize - 1];
  if (!lastItem) return pages;

  return recursiveInsertFirstItem(lastItem, pages, pageIndex + 1, pageSize);
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

function recursiveInsertFirstItem<T>(
  item: T,
  pages: ItemsPage<T>[],
  pageIndex: number,
  pageSize: number,
): ItemsPage<T>[] {
  const page = pages.find((p) => p.pageIndex === pageIndex);
  if (!page) return [...pages, { pageIndex, items: [item] }];
  if (page.items.length < pageSize) {
    return [
      ...pages.map((p) =>
        p.pageIndex === pageIndex
          ? { pageIndex, items: [item, ...p.items] }
          : p,
      ),
    ];
  }
  const lastItem = page.items[pageSize - 1];
  const itemsUpdated = page.items.splice(0, pageSize, item);
  const pagesUpdated = pages.map((p) =>
    p.pageIndex === pageIndex ? { pageIndex, items: itemsUpdated } : p,
  );
  return recursiveInsertFirstItem(
    lastItem,
    pagesUpdated,
    pageIndex + 1,
    pageSize,
  );
}
