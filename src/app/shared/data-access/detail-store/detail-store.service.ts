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
  removeFirst,
  switchMapWithCancel,
} from '../../utility';
import { Operation } from '../operation.type';
import { environment } from 'src/environments/environment';
import { OperationType, OperationTypeLike } from '../operation-type.enum';

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

  error = computed<Error | undefined>(() => this.state().error);

  currentOperations = computed<OperationTypeLike[]>(() => [
    ...new Set(this.state().currentOperations),
  ]);

  itemKeys$ = new Subject<Record<string, unknown>>();

  private keys$ = this.itemKeys$.pipe(distinctUntilChanged(areEqualObjects));

  refresh$ = new Subject<void>();
  operation$ = new Subject<Operation>();
  loadRelatedItems$ = new Subject<void>();

  constructor() {
    this.keys$
      .pipe(
        filter((keys) => !!keys),
        tap(() => this.addCurrentOperation(OperationType.Fetch)),
        switchMapWithCancel(
          (keys) =>
            this.handler.get(keys).pipe(
              catchError((error) => {
                this.removeCurrentOperation(OperationType.Fetch);
                return onHandlerError(error, this.state);
              }),
            ),
          () => this.removeCurrentOperation(OperationType.Fetch),
        ),
        tap((item) =>
          this.state.update((state) => ({
            ...state,
            item,
            error: undefined,
          })),
        ),
        tap(() => this.removeCurrentOperation(OperationType.Fetch)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.loadRelatedItems$
      .pipe(
        withLatestFrom(this.keys$),
        filter(([_, keys]) => !!keys && !!this.handler.loadRelatedItems),
        tap(() => this.addCurrentOperation(OperationType.Fetch)),
        switchMapWithCancel(
          ([_, keys]) =>
            this.handler.loadRelatedItems!(keys).pipe(
              catchError((error) => {
                this.removeCurrentOperation(OperationType.Fetch);
                return onHandlerError(error, this.state);
              }),
            ),
          () => this.removeCurrentOperation(OperationType.Fetch),
        ),
        tap((relatedItems) =>
          this.state.update((state) => ({
            ...state,
            relatedItems,
            error: undefined,
          })),
        ),
        tap(() => this.removeCurrentOperation(OperationType.Fetch)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.refresh$
      .pipe(
        filter(() => !!this.item()),
        tap(() => this.addCurrentOperation(OperationType.Fetch)),
        withLatestFrom(this.keys$),

        switchMapWithCancel(
          ([_, keys]) =>
            this.handler.get(keys).pipe(
              catchError((error) => {
                this.removeCurrentOperation(OperationType.Fetch);
                return onHandlerError(error, this.state);
              }),
            ),
          () => this.removeCurrentOperation(OperationType.Fetch),
        ),
        tap((item) =>
          this.state.update((state) => ({
            ...state,
            item,
            error: undefined,
          })),
        ),
        tap(() => this.removeCurrentOperation(OperationType.Fetch)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.operation$
      .pipe(
        withLatestFrom(this.keys$.pipe(startWith({}))),
        mergeMap(([operation, keys]) => {
          this.addCurrentOperation(operation.type);
          const canOperate$ = forceObservable(
            this.handler.canOperate?.(operation, this.item(), keys) || true,
          );
          return canOperate$.pipe(
            filter((canOperate) => canOperate),
            switchMap(() => {
              const item = this.item();
              const itemMutation = this.handler.mutateItem?.(operation, item);

              const operation$ = this.handler.operate(operation, item, keys);

              if (!item || !itemMutation) {
                return operation$.pipe(
                  catchError((error) => {
                    this.removeCurrentOperation(operation.type);
                    return onHandlerError(error, this.state);
                  }),
                  map((updatedItem) => ({
                    operation,
                    item: updatedItem || item,
                  })),
                  tap(({ item }) =>
                    this.state.update((state) => ({
                      ...state,
                      item,
                      error: undefined,
                    })),
                  ),
                  tap(() => this.removeCurrentOperation(operation.type)),
                );
              }

              const mutate$ = forceObservable(itemMutation).pipe(
                tap((mutatedItem) =>
                  this.state.update((state) => ({
                    ...state,
                    item: mutatedItem,
                    error: undefined,
                  })),
                ),
                tap(() => this.removeCurrentOperation(operation.type)),
              );

              return combineLatest([mutate$, operation$]).pipe(
                map(([updatedItem]) => ({
                  operation,
                  item: updatedItem || item,
                })),
                catchError((error) => {
                  this.removeCurrentOperation(operation.type);
                  return onHandlerError(error, this.state, { item });
                }),
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

  private addCurrentOperation(operationType: OperationTypeLike): void {
    this.state.update((state) => ({
      ...state,
      currentOperations: [...state.currentOperations, operationType],
    }));
  }

  private removeCurrentOperation(operationType: OperationTypeLike): void {
    this.state.update((state) => ({
      ...state,
      currentOperations: removeFirst(
        state.currentOperations,
        (o) => o === operationType,
      ),
    }));
  }
}
