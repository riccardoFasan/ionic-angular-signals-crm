import { Pagination, SearchCriteria } from '../utility';

export type ListState<T> = {
  items: T[];
  searchCriteria: SearchCriteria;
  total: number;
  loading: boolean;
  error?: Error;
};

export const INITIAL_LIST_PAGINATION: Pagination = {
  pageSize: 18,
  pageIndex: 0,
};

export const INITIAL_SEARCH_CRITERIA: SearchCriteria = {
  filters: {},
  pagination: INITIAL_LIST_PAGINATION,
};

export const INITIAL_LIST_STATE: ListState<any> = {
  items: [],
  total: 0,
  searchCriteria: INITIAL_SEARCH_CRITERIA,
  loading: false,
};
