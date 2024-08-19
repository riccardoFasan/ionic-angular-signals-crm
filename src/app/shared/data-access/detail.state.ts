import { MachineState } from './machine-state.enum';

export type DetailState<
  Entity extends Record<string, unknown>,
  REntities extends Record<string, unknown> | undefined = undefined,
> = {
  mode: MachineState;
  item?: Entity;
  relatedItems?: REntities;
  error?: Error;
};

export const INITIAL_DETAIL_STATE: DetailState<Record<string, unknown>> = {
  mode: MachineState.Idle,
};
