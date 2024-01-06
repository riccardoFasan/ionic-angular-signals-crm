import { MachineState } from './machine-state.enum';

export type DetailState<T> = {
  mode: MachineState;
  item?: T;
  error?: Error;
};

export const INITIAL_DETAIL_STATE: DetailState<any> = {
  item: undefined,
  mode: MachineState.Idle,
};
