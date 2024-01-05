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
import { Effect } from '../effect.type';

@Injectable()
export class DetailStoreService<T> {
  private handler = inject(STORE_HANDLER);
  private toasts = inject(ToastsService);

  private state = signal<DetailState<T>>(INITIAL_DETAIL_STATE);

  item = computed<T | undefined>(() => this.state().item);
  loading = computed<boolean>(() => this.state().loading);
  error = computed<Error | undefined>(() => this.state().error);

  id$ = new Subject<number>();
  refresh$ = new Subject<void>();
  effect$ = new Subject<Effect>();

  constructor() {
    this.id$
      .pipe(
        takeUntilDestroyed(),
        filter((id) => !!id),
        distinctUntilChanged(),
        tap(() => this.state.update((state) => ({ ...state, loading: true }))),
        switchMap((id) =>
          this.handler
            .get(id)
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
        tap((item) =>
          this.state.update((state) => ({
            ...state,
            item,
            loading: false,
            error: undefined,
          })),
        ),
      )
      .subscribe();

    this.refresh$
      .pipe(
        takeUntilDestroyed(),
        filter(() => !!this.item()),
        tap(() => this.state.update((state) => ({ ...state, loading: true }))),
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
            loading: false,
            error: undefined,
          })),
        ),
      )
      .subscribe();

    this.effect$
      .pipe(
        takeUntilDestroyed(),
        filter(() => !this.item()),
        tap(() => this.state.update((state) => ({ ...state, loading: true }))),
        switchMap((effect) =>
          this.handler.effect(effect, this.item()).pipe(
            catchError((error) => onHandlerError(error, this.state)),
            map((item) => [effect, item]),
          ),
        ),
        tap(([_, item]) =>
          this.state.update((state) => ({
            ...state,
            item,
            loading: false,
            error: undefined,
          })),
        ),
        switchMap(([effect, item]) =>
          this.handler
            .onEffect(effect, item)
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
      )
      .subscribe();

    effect(() => {
      const error = this.error();
      if (!error) return;

      const message = this.handler.interpretError?.(error, this.item());
      this.toasts.error(message);
    });
  }
}
