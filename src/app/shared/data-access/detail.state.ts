import { MachineState } from './machine-state.enum';

export type DetailState<Entity> = {
  mode: MachineState;
  item?: Entity;
  error?: Error;
};

export const INITIAL_DETAIL_STATE: DetailState<never> = {
  item: undefined,
  mode: MachineState.Idle,
};
