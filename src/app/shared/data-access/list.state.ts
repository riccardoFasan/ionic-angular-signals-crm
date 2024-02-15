import {
  FilterClause,
  Pagination,
  SearchCriteria,
  SortOrder,
  Sorting,
} from '../utility';
import { MachineState } from './machine-state.enum';

export type ListState<T> = {
  items: T[];
  searchCriteria: SearchCriteria;
  total: number;
  mode: MachineState;
  error?: Error;
};

export const INITIAL_LIST_PAGINATION: Pagination = {
  pageSize: 18,
  pageIndex: 0,
};

export const INITIAL_LIST_SORTINGS: Sorting[] = [
  { property: 'name', order: SortOrder.Ascending },
];

export const INITIAL_SEARCH_CRITERIA: SearchCriteria = {
  filters: {
    query: {},
    clause: FilterClause.And,
  },
  pagination: INITIAL_LIST_PAGINATION,
  sortings: INITIAL_LIST_SORTINGS,
};

export const INITIAL_LIST_STATE: ListState<never> = {
  items: [],
  total: 0,
  searchCriteria: INITIAL_SEARCH_CRITERIA,
  mode: MachineState.Idle,
};
