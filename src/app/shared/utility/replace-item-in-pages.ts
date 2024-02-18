import { ItemsPage } from './items-page.type';

export function replaceItemInPages<T>(
  item: T,
  pages: ItemsPage<T>[],
  pageIndex: number,
  extractId: (item: T) => number | string,
): ItemsPage<T>[] {
  return pages.map((p) =>
    p.pageIndex === pageIndex
      ? {
          pageIndex,
          items: p.items.map((i) =>
            extractId(i) === extractId(item) ? item : i,
          ),
        }
      : p,
  );
}
