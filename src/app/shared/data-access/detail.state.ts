import { MachineState } from './machine-state.enum';

export type DetailState<
  Entity extends Record<string, unknown>,
  PEntities extends Record<string, unknown>,
> = {
  mode: MachineState;
  item?: Entity;
  parentItems?: PEntities;
  error?: Error;
};

export const INITIAL_DETAIL_STATE: DetailState<
  never,
  Record<string, unknown>
> = {
  mode: MachineState.Idle,
};
