import { Pagination } from './pagination.model';
import { Sorting } from './sorting.model';

export type SearchCriteria = {
  pagination: Pagination;
  sorting?: Sorting;
  filters: Record<string, string | number | boolean>;
};
