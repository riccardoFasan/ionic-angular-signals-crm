import { Pagination, SearchCriteria } from '../utility';

export type ListState<T> = {
  items: T[];
  searchCriteria: SearchCriteria;
  count: number;
  loading: boolean;
  error?: Error;
};

export const INITIAL_LIST_PAGINATION: Pagination = {
  pageSize: 10,
  pageIndex: 0,
};

export const INITIAL_LIST_STATE: ListState<any> = {
  items: [],
  count: 0,
  searchCriteria: {
    filters: {},
    pagination: INITIAL_LIST_PAGINATION,
  },
  loading: false,
};
