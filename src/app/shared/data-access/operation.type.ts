import { OperationType } from './operation-type.enum';

export type Operation = {
  type: OperationType | string;
  payload?: unknown;
};
