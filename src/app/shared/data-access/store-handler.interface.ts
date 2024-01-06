import { Observable } from 'rxjs';
import { List, SearchCriteria } from '../utility';
import { Operation } from './operation.type';

export interface StoreHandler<T> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(searchCriteria: SearchCriteria): Observable<List<T>>;
  operate(operation: Operation, item?: T): Observable<T>;
  onOperation(operation: Operation, item: T): Observable<void>;
  interpretError?(error: Error, item?: T): string | undefined;
}
