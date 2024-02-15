import { Pagination } from './pagination.type';
import { SearchFilters } from './search-filters.type';
import { Sorting } from './sorting.type';

export type SearchCriteria = {
  pagination: Pagination;
  filters: SearchFilters;
  sortings?: Sorting[];

  // meant to support custom edge cases not covered by the other properties
  params?: Record<string, string | number | boolean>;
};
