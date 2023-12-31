export type List<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};
