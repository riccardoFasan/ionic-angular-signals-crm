import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DetailState, INITIAL_DETAIL_STATE } from '../detail.state';
import {
  Subject,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { STORE_HANDLER } from '../store-handler.token';
import { ToastsService, onHandlerError } from '../../utility';
import { Operation } from '../operation.type';
import { MachineState } from '../machine-state.enum';

@Injectable()
export class DetailStoreService<T> {
  private handler = inject(STORE_HANDLER);
  private toasts = inject(ToastsService);

  private state = signal<DetailState<T>>(INITIAL_DETAIL_STATE);

  item = computed<T | undefined>(() => this.state().item);
  mode = computed<MachineState>(() => this.state().mode);
  error = computed<Error | undefined>(() => this.state().error);

  id$ = new Subject<number>();
  refresh$ = new Subject<void>();
  operation$ = new Subject<Operation>();

  constructor() {
    this.id$
      .pipe(
        takeUntilDestroyed(),
        filter((id) => !!id),
        distinctUntilChanged(),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap((id) =>
          this.handler
            .get(id)
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
        tap((item) =>
          this.state.update((state) => ({
            ...state,
            item,
            mode: MachineState.Idle,
            error: undefined,
          })),
        ),
      )
      .subscribe();

    this.refresh$
      .pipe(
        takeUntilDestroyed(),
        filter(() => !!this.item()),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        map(() => this.handler.extractId(this.item()!)),
        switchMap((id) =>
          this.handler
            .get(id)
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
        tap((item) =>
          this.state.update((state) => ({
            ...state,
            item,
            mode: MachineState.Idle,
            error: undefined,
          })),
        ),
      )
      .subscribe();

    this.operation$
      .pipe(
        takeUntilDestroyed(),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Processing,
          })),
        ),
        switchMap((operation) =>
          this.handler.operate(operation, this.item()).pipe(
            catchError((error) => onHandlerError(error, this.state)),
            map((item) => [operation, item]),
          ),
        ),
        tap(([_, item]) =>
          this.state.update((state) => ({
            ...state,
            item,
            mode: MachineState.Idle,
            error: undefined,
          })),
        ),
        switchMap(([operation, item]) =>
          this.handler
            .onOperation(operation, item)
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
      )
      .subscribe();

    effect(() => {
      const error = this.error();
      if (!error) return;

      const message = this.handler.interpretError?.(error, this.item());
      console.error({ error, message });
      this.toasts.error(message);
    });
  }
}
