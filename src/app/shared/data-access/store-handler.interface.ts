import { Observable } from 'rxjs';
import { ItemsPage, List, SearchCriteria } from '../utility';
import { Operation } from './operation.type';
import { ItemsMutation } from './items-mutation.type';
import { ListState } from './list.state';
import { DetailState } from './detail.state';

export interface StoreHandler<
  Entity extends Record<string, unknown>,
  Keys extends Record<string, string | number>,
  ExtendedEntity extends Entity = Entity,
  REntities extends Record<string, unknown> | undefined = undefined,
> {
  initialState?: {
    list?: Partial<ListState<Entity, REntities>>;
    detail?: Partial<DetailState<ExtendedEntity, REntities>>;
  };

  extractPk(item: Entity): string | number;
  extractName(item: Entity): string;

  get(keys: Keys): Observable<ExtendedEntity>;
  getList(searchCriteria: SearchCriteria, keys: Keys): Observable<List<Entity>>;

  loadRelatedItems?(keys: Keys): Observable<REntities>;

  canOperate?(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    keys?: Keys,
  ): Observable<boolean> | boolean;

  operate(
    operation: Operation,
    item?: Entity | ExtendedEntity,
    keys?: Keys,
  ): Observable<Entity | ExtendedEntity | void>;

  // mutateItem is intended for optimistic updates.
  mutateItem?(
    operation: Operation,
    item: ExtendedEntity,
  ): ExtendedEntity | void;

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
    keys?: Keys,
  ): Observable<void> | void;

  interpretError?(
    error: Error,
    item?: Entity | ExtendedEntity,
  ): string | undefined;
}
