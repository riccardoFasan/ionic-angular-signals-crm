import { FilterClause } from './filter-clause.enum';

export type SearchFilters = {
  query: Record<string, string | number | boolean | Date>;
  clause: FilterClause;
};
