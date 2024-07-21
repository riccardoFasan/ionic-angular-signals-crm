import { ItemsPage } from './items-page.type';
import { Pagination } from './pagination.type';

export function removeSorted<Entity, EntityKey>(
  item: Entity,
  pages: ItemsPage<Entity>[],
  { pageSize }: Pagination,
  extractPk: (item: Entity) => EntityKey,
): ItemsPage<Entity>[] {
  let page = pages.find((page) =>
    page.items.some((i) => extractPk(i) === extractPk(item)),
  );

  if (!page) return pages;

  const pageIndex = page.pageIndex;

  page = {
    pageIndex,
    items: page.items.filter((i) => extractPk(i) !== extractPk(item)),
  };

  pages = pages.map((p) => (p.pageIndex === pageIndex ? page! : p));

  const hasMorePages = pages.some((p) => p.pageIndex > pageIndex);

  if (!hasMorePages) return pages;

  return recursiveFillLastItem(pages, pageIndex, pageSize);
}

function recursiveFillLastItem<Entity>(
  pages: ItemsPage<Entity>[],
  pageIndex: number,
  pageSize: number,
): ItemsPage<Entity>[] {
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
