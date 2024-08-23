import { OperationTypeLike } from './operation-type.enum';

export type ItemOperation<Entity> = {
  item?: Entity;
  type: OperationTypeLike;
};
