import { WritableSignal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { MachineState } from '../data-access';

type Store = { mode: MachineState; error?: Error };
type StoreState<T> = T extends Store ? T : never;

export function onHandlerError<T>(
  error: Error,
  state: WritableSignal<StoreState<T>>,
  newState: Partial<StoreState<T>> = {},
): Observable<never> {
  state.update((state) => ({
    ...state,
    error,
    mode: MachineState.Idle,
    ...newState,
  }));
  return EMPTY;
}
