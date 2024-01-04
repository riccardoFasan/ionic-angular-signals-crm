import { Observable } from 'rxjs';
import { List, SearchCriteria } from '../utility';
import { Effect } from './effect.type';

export interface StoreHandler<T> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(searchCriteria: SearchCriteria): Observable<List<T>>;
  effect(effect: Effect, item?: T): Observable<T>;
  onEffect(effect: Effect, item: T): Observable<void>;
  interpretError?(error: Error, item?: T): string | undefined;
}
