import { Observable } from 'rxjs';
import { ItemsPage, List, SearchCriteria } from '../utility';
import { Operation } from './operation.type';
import { ItemsMutation } from './items-mutation.type';
import { ListState } from './list.state';
import { DetailState } from './detail.state';

export interface StoreHandler<
  Entity extends Record<string, unknown>,
  EntityKey = number,
  ExtendedEntity extends Entity = Entity,
  RKeys extends Record<string, unknown> | undefined = undefined,
  REntities extends Record<string, unknown> | undefined = undefined,
> {
  initialState?: {
    list?: Partial<ListState<Entity, REntities>>;
    detail?: Partial<DetailState<ExtendedEntity, REntities>>;
  };

  extractPk(item: Entity): EntityKey;
  extractName(item: Entity): string;
  get(pk: EntityKey, relatedItemsKeys?: RKeys): Observable<ExtendedEntity>;
  getList(
    searchCriteria: SearchCriteria,
    relatedItemsKeys?: RKeys,
  ): Observable<List<Entity>>;

  loadRelatedItems?(relatedItemsKeys: RKeys): Observable<REntities>;

  canOperate?(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    relatedItemsKeys?: RKeys,
  ): Observable<boolean> | boolean;

  operate(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    relatedItemsKeys?: RKeys,
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
    relatedItemsKeys?: RKeys,
  ): Observable<void> | void;

  interpretError?(
    error: Error,
    item?: Entity | ExtendedEntity,
  ): string | undefined;
}
