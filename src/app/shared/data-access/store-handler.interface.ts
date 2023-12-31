import { Observable } from 'rxjs';
import { List } from '../utility';

export interface StoreHandler<T> {
  extractId(item: T): number;
  extractName(item: T): string;
  get(id: number): Observable<T>;
  getList(): Observable<List<T>>;
  create(item: Omit<T, 'id'>): Observable<T>;
  delete(item: T): Observable<T>;
  update(item: T): Observable<T>;
}
