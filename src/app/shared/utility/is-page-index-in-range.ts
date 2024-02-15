export function isPageIndexInRange(
  pageIndex: number,
  pageSize: number,
  total: number,
): boolean {
  return pageIndex * pageSize < total;
}
