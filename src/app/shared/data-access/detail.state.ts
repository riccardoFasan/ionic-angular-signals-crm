export type DetailState<T> = {
  loading: boolean;
  item?: T;
  error?: Error;
};

export const INITIAL_DETAIL_STATE: DetailState<any> = {
  item: undefined,
  loading: false,
};
