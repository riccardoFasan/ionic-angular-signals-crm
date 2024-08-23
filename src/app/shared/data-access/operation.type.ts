import { OperationTypeLike } from './operation-type.enum';

export type Operation = {
  type: OperationTypeLike;
  payload?: unknown;
};
