import { Observable } from 'rxjs';
import { List, SearchCriteria } from '../utility';
import { EffectType } from './effect-type.enum';

export interface StoreHandler<T, E extends EffectType> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(searchCriteria: SearchCriteria): Observable<List<T>>;
  effect(type: E, formData: unknown, item?: T): Observable<T>;
  onEffect(type: E, item: T): Observable<void>;
  interpretError?(error: Error, item?: T): string | undefined;
}
