import { Pagination } from './pagination.type';
import { Sorting } from './sorting.type';

export type SearchCriteria = {
  pagination: Pagination;
  sorting?: Sorting;
  filters: Record<string, string | number | boolean>;
};
