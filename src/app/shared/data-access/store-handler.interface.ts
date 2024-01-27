import { Observable } from 'rxjs';
import { List, SearchCriteria } from '../utility';
import { Operation } from './operation.type';

export interface StoreHandler<T> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(searchCriteria: SearchCriteria): Observable<List<T>>;
  operate(operation: Operation, item?: T): Observable<T>;

  // mutateItems is intended to for optimistic updates.
  // pushSorted utility is meant to be used with create operations and
  // can lead to some complex code if you have to handle tricky filters
  // or sortings. So think carefully before using and consider
  // a simple refresh by returnin undefined or void in this case.
  mutateItems?(
    operation: Operation,
    item: T,
    items: T[],
    total: number,
    searchCriteria: SearchCriteria,
  ): ItemsMutation<T> | Observable<ItemsMutation<T>> | void;

  onOperation(operation: Operation, item: T): Observable<void>;
  interpretError?(error: Error, item?: T): string | undefined;
}

export type ItemsMutation<T> = {
  items: T[];
  total: number;
};
