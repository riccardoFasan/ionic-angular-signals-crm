export type List<T> = {
  pageIndex: number;
  pageSize: number;
  total: number;
  items: T[];
};
