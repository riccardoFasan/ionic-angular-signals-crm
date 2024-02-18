import { SearchCriteria } from './search-criteria.type';

export function getSearchCriteriaWithPage(
  pageIndex: number,
  searchCriteria: SearchCriteria,
): SearchCriteria {
  return {
    ...searchCriteria,
    pagination: {
      ...searchCriteria.pagination,
      pageIndex,
    },
  };
}
