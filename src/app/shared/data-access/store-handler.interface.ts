import { Observable } from 'rxjs';
import { List, SearchCriteria } from '../utility';
import { Operation } from './operation.type';
import { ItemsMutation } from './items-mutation.type';

export interface StoreHandler<T> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(searchCriteria: SearchCriteria): Observable<List<T>>;

  canOperate?(operation: Operation, item?: T): Observable<boolean> | boolean;

  operate(operation: Operation, item?: T): Observable<T>;

  // mutateItems is intended for optimistic updates.
  // pushSorted utility is meant to be used with create operations
  // and can lead to some complex code if you have to handle tricky
  // filters or sortings. So think carefully before using and consider
  // a simple refresh by returning undefined or void.
  mutateItems?(
    operation: Operation,
    item: T,
    items: T[],
    total: number,
    searchCriteria: SearchCriteria,
  ): ItemsMutation<T> | void;

  // intended for side effects like toasts or redirections. Use operate for data management
  onOperation?(operation: Operation, item: T): Observable<void> | void;

  interpretError?(error: Error, item?: T): string | undefined;
}
