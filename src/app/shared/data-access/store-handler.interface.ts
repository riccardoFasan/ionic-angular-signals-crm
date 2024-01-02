import { Observable } from 'rxjs';
import { List, SearchCriteria } from '../utility';
import { Effect } from './effect.type';

export interface StoreHandler<T, E> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(searchCriteria: SearchCriteria): Observable<List<T>>;
  effect(effect: Effect<E>, item?: T): Observable<T>;
  onEffect(effect: Effect<E>, item: T): Observable<void>;
  interpretError?(error: Error, item?: T): string | undefined;
}
