import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DetailState, INITIAL_DETAIL_STATE } from '../detail.state';
import {
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { STORE_HANDLER } from '../store-handler.token';
import {
  ErrorInterpreterService,
  ToastsService,
  areEqualObjects,
  forceObservable,
  onHandlerError,
} from '../../utility';
import { Operation } from '../operation.type';
import { MachineState } from '../machine-state.enum';
import { environment } from 'src/environments/environment';

@Injectable()
export class DetailStoreService<
  Entity extends Record<string, unknown>,
  REntities extends Record<string, unknown> = {},
> {
  private handler = inject(STORE_HANDLER);
  private errorInterpreter = inject(ErrorInterpreterService);
  private toasts = inject(ToastsService);

  private state = signal<DetailState<Entity, REntities>>(this.initialState);

  item = computed<Entity | undefined>(() => this.state().item);
  relatedItems = computed<REntities | undefined>(
    () => this.state().relatedItems,
  );
  mode = computed<MachineState>(() => this.state().mode);
  error = computed<Error | undefined>(() => this.state().error);

  itemKeys$ = new Subject<Record<string, unknown>>();

  private keys$ = this.itemKeys$.pipe(distinctUntilChanged(areEqualObjects));

  refresh$ = new Subject<void>();
  operation$ = new Subject<Operation>();
  loadRelatedItems$ = new Subject<void>();

  constructor() {
    this.keys$
      .pipe(
        filter((keys) => !!keys),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap((keys) =>
          this.handler
            .get(keys)
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
        takeUntilDestroyed(),
      )
      .subscribe();

    this.loadRelatedItems$
      .pipe(
        withLatestFrom(this.keys$),
        filter((keys) => !!keys && !!this.handler.loadRelatedItems),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap((keys) =>
          this.handler.loadRelatedItems!(keys).pipe(
            catchError((error) => onHandlerError(error, this.state)),
          ),
        ),
        tap((relatedItems) =>
          this.state.update((state) => ({
            ...state,
            relatedItems,
            mode: MachineState.Idle,
            error: undefined,
          })),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.refresh$
      .pipe(
        filter(() => !!this.item()),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        withLatestFrom(this.keys$),
        switchMap((keys) =>
          this.handler
            .get(keys)
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
        takeUntilDestroyed(),
      )
      .subscribe();

    this.operation$
      .pipe(
        withLatestFrom(this.keys$.pipe(startWith({}))),
        mergeMap(([operation, keys]) => {
          const canOperate$ = forceObservable(
            this.handler.canOperate?.(operation, this.item(), keys) || true,
          );
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Processing,
          }));
          return canOperate$.pipe(
            filter((canOperate) => canOperate),
            switchMap(() => {
              const item = this.item();
              const itemMutation = this.handler.mutateItem?.(operation, item);

              const operation$ = this.handler.operate(operation, item, keys);

              if (!item || !itemMutation) {
                return operation$.pipe(
                  catchError((error) => onHandlerError(error, this.state)),
                  map((updatedItem) => ({
                    operation,
                    item: updatedItem || item,
                  })),
                  tap(({ item }) =>
                    this.state.update((state) => ({
                      ...state,
                      item,
                      mode: MachineState.Idle,
                      error: undefined,
                    })),
                  ),
                );
              }

              const mutate$ = forceObservable(itemMutation).pipe(
                tap((mutatedItem) =>
                  this.state.update((state) => ({
                    ...state,
                    item: mutatedItem,
                    mode: MachineState.Idle,
                    error: undefined,
                  })),
                ),
              );

              return combineLatest([mutate$, operation$]).pipe(
                map(([updatedItem]) => ({
                  operation,
                  item: updatedItem || item,
                })),
                catchError((error) =>
                  onHandlerError(error, this.state, { item }),
                ),
              );
            }),
            switchMap(({ operation, item }) =>
              forceObservable(
                this.handler.onOperation?.(operation, item, keys),
              ),
            ),
          );
        }, environment.operationsConcurrency),
        takeUntilDestroyed(),
      )
      .subscribe();

    effect(() => {
      const error = this.error();
      if (!error) return;

      const message =
        this.handler.interpretError?.(error) ||
        this.errorInterpreter.interpretError(error);

      console.error({ error, message });
      this.toasts.error(message);
    });
  }

  private get initialState(): DetailState<Entity, REntities> {
    return {
      ...INITIAL_DETAIL_STATE,
      ...(this.handler.initialState?.detail || {}),
    };
  }
}
