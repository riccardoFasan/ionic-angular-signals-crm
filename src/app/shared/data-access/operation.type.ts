import { Observable } from 'rxjs';
import { OperationTypeLike } from './operation-type.enum';

type OptionArgument<
  Entity extends Record<string, unknown>,
  Keys extends Record<string, string | number> = {},
  ExtendedEntity extends Entity = Entity,
> = {
  operation: Operation;
  item?: Entity | ExtendedEntity;
  keys?: Keys;
};

export type OperationUIOptions<
  Entity extends Record<string, unknown>,
  Keys extends Record<string, string | number> = {},
  ExtendedEntity extends Entity = Entity,
> = {
  canOperate?(
    args: OptionArgument<Entity, Keys, ExtendedEntity>,
  ): Observable<boolean> | boolean;
  onOperation?(
    args: OptionArgument<Entity, Keys, ExtendedEntity>,
  ): Observable<void> | void;
};

export type Operation = {
  type: OperationTypeLike;
  payload?: unknown;
};

export type OperationWithOptions<
  Entity extends Record<string, unknown>,
  Keys extends Record<string, string | number>,
  ExtendedEntity extends Entity = Entity,
> = { operation: Operation } & {
  options?: OperationUIOptions<Entity, Keys, ExtendedEntity>;
};
