import { Observable, isObservable, of } from 'rxjs';

export function forceObservable<T>(value: T | Observable<T>): Observable<T> {
  return isObservable(value) ? value : of(value);
}
