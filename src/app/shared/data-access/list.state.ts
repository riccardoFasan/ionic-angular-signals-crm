import {
  FilterClause,
  ItemsPage,
  Pagination,
  SearchCriteria,
  SortOrder,
  Sorting,
} from '../utility';
import { OperationType } from './operation-type.enum';

export type ListState<
  Entity extends Record<string, unknown>,
  REntities extends Record<string, unknown> | undefined = undefined,
> = {
  currentItemOperations: ItemOperation<Entity>[];
  pages: ItemsPage<Entity>[];
  searchCriteria: SearchCriteria;
  total: number;
  relatedItems?: REntities;
  error?: Error;
};

export type ItemOperation<Entity> = {
  item?: Entity;
  operationType: OperationType | string;
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
  pages: [],
  currentItemOperations: [],
  total: 0,
  searchCriteria: INITIAL_SEARCH_CRITERIA,
};
