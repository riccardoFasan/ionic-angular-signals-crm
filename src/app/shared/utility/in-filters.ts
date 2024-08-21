import { FilterClause } from './filter-clause.enum';
import { SearchFilters } from './search-filters.type';

export function inFilters<Entity>(
  item: Entity,
  { query, clause }: SearchFilters,
): boolean {
  if (Object.keys(query).length === 0) return true;
  const are = clause === FilterClause.And ? 'every' : 'some';
  return Object.entries(query)[are](([key, value]) => {
    const record = item as Record<string, string | number | boolean | Date>;
    return value === record[key];
  });
}
