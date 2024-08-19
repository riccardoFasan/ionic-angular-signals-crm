export type List<Entity> = {
  pageIndex: number;
  pageSize: number;
  total: number;
  items: Entity[];
};
