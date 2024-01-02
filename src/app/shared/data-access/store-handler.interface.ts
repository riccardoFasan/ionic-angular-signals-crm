import { Observable } from 'rxjs';
import { List } from '../utility';
import { Effect } from './effect.type';

export interface StoreHandler<T> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(): Observable<List<T>>;
  effect(effect: Effect<T>, item?: T): Observable<T>;
  onEffect(effect: Effect<T>, item: T): Observable<void>;
  interpretError?(error: Error, item?: T): string | undefined;
}
