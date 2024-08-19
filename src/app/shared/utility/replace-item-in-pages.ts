import { ItemsPage } from './items-page.type';

export function replaceItemInPages<Entity, EntityKey>(
  item: Entity,
  pages: ItemsPage<Entity>[],
  pageIndex: number,
  extractPk: (item: Entity) => EntityKey,
): ItemsPage<Entity>[] {
  return pages.map((p) =>
    p.pageIndex === pageIndex
      ? {
          pageIndex,
          items: p.items.map((i) =>
            extractPk(i) === extractPk(item) ? item : i,
          ),
        }
      : p,
  );
}
