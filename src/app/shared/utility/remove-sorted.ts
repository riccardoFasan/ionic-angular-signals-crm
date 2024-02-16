import { ItemsPage } from './items-page.type';
import { Pagination } from './pagination.type';

export function removeSorted<T>(
  item: T,
  pages: ItemsPage<T>[],
  { pageSize }: Pagination,
  extractId: (item: T) => number,
): ItemsPage<T>[] {
  let page = pages.find((page) =>
    page.items.some((i) => extractId(i) === extractId(item)),
  );

  if (!page) return pages;

  const pageIndex = page.pageIndex;

  page = {
    pageIndex,
    items: page.items.filter((i) => extractId(i) !== extractId(item)),
  };

  pages = pages.map((p) => (p.pageIndex === pageIndex ? page! : p));

  const hasMorePages = pages.some((p) => p.pageIndex > pageIndex);

  if (!hasMorePages) return pages;

  return recursiveFillLastItem(pages, pageIndex, pageSize);
}

function recursiveFillLastItem<T>(
  pages: ItemsPage<T>[],
  pageIndex: number,
  pageSize: number,
): ItemsPage<T>[] {
  const page = pages.find((p) => p.pageIndex === pageIndex);
  if (!page || page.items.length >= pageSize) return pages;

  const nextPageIndex = pageIndex + 1;
  const nextPage = pages.find((p) => p.pageIndex === nextPageIndex);
  if (!nextPage) return pages;

  const firstNextItem = nextPage.items[0];

  pages = pages.map((p) => {
    if (p.pageIndex === pageIndex) {
      return { pageIndex, items: [...page.items, firstNextItem] };
    }
    if (p.pageIndex === nextPageIndex) {
      return { pageIndex: nextPage.pageIndex, items: nextPage.items.slice(1) };
    }
    return p;
  });

  return recursiveFillLastItem(pages, nextPageIndex, pageSize);
}
