import { WritableSignal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

type Store = { loading: boolean; error?: Error };
type StoreState<T> = T extends Store ? T : never;

export function onHandlerError<T>(
  error: Error,
  state: WritableSignal<StoreState<T>>,
  newState: Partial<StoreState<T>> = {},
): Observable<never> {
  state.update((state) => ({ ...state, error, loading: false, ...newState }));
  return EMPTY;
}
