import { Observable } from 'rxjs';
import { ItemsPage, List, SearchCriteria } from '../utility';
import { Operation } from './operation.type';
import { ItemsMutation } from './items-mutation.type';
import { ListState } from './list.state';
import { DetailState } from './detail.state';

export interface StoreHandler<
  Entity extends Record<string, unknown>,
  EntityKey,
  ExtendedEntity extends Entity = Entity,
  PKeys extends Record<string, unknown> = {},
  PEntities extends Record<string, unknown> = {},
> {
  initialState?: {
    list?: Partial<ListState<Entity, PEntities>>;
    detail?: Partial<DetailState<ExtendedEntity, PEntities>>;
  };

  loadParentsFirst?: boolean;

  extractPk(item: Entity): EntityKey;
  extractName(item: Entity): string;
  get(pk: EntityKey, parentKeys?: PKeys): Observable<ExtendedEntity>;
  getList(
    searchCriteria: SearchCriteria,
    parentKeys?: PKeys,
  ): Observable<List<Entity>>;

  loadParents?(parentKeys: PKeys): Observable<PEntities>;

  canOperate?(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    parentKeys?: PKeys,
  ): Observable<boolean> | boolean;

  operate(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    parentKeys?: PKeys,
  ): Observable<Entity | ExtendedEntity | void>;

  // mutateItems is intended for optimistic updates.
  // pushSorted utility is meant to be used with create operations
  // and can lead to some complex code if you have to handle tricky
  // filters or sortings. So think carefully before using and consider
  // a simple refresh by returning undefined or void.
  mutateItems?(
    operation: Operation,
    item: Entity,
    pages: ItemsPage<Entity>[],
    total: number,
    searchCriteria: SearchCriteria,
  ): ItemsMutation<Entity> | void;

  // intended for side effects like toasts or redirections. Use operate for data management
  onOperation?(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    parentKeys?: PKeys,
  ): Observable<void> | void;

  interpretError?(
    error: Error,
    item?: Entity | ExtendedEntity,
  ): string | undefined;
}
