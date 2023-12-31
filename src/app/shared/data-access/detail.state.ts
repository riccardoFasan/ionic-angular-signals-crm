export type DetailState<T> = {
  loading: boolean;
  item?: T;
  error?: string;
};

export const INITIAL_DETAIL_STATE: DetailState<unknown> = {
  item: undefined,
  loading: false,
};
