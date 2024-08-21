import { pushSorted } from '../data-access';
import { ItemsPage } from './items-page.type';
import { removeSorted } from './remove-sorted';
import { SearchCriteria } from './search-criteria.type';

export function updateSorted<Entity, EntityKey>(
  item: Entity,
  pages: ItemsPage<Entity>[],
  searchCriteria: SearchCriteria,
  extractPk: (item: Entity) => EntityKey,
): ItemsPage<Entity>[] {
  pages = removeSorted(item, pages, searchCriteria, extractPk);
  return pushSorted(item, pages, searchCriteria);
}
