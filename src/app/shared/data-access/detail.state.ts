import { OperationType } from './operation-type.enum';

export type DetailState<
  Entity extends Record<string, unknown>,
  REntities extends Record<string, unknown> | undefined = undefined,
> = {
  currentOperations: (OperationType | string)[];
  item?: Entity;
  relatedItems?: REntities;
  error?: Error;
};

export const INITIAL_DETAIL_STATE: DetailState<Record<string, unknown>> = {
  currentOperations: [],
};
