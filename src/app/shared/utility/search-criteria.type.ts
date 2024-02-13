import { Pagination } from './pagination.type';
import { SearchFilters } from './search-filters.type';
import { Sorting } from './sorting.type';

export type SearchCriteria = {
  pagination: Pagination;
  sortings?: Sorting[];
  filters: SearchFilters;
};
