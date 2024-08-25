import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { environment } from 'src/environments/environment';
import {
  ErrorInterpreterService,
  ToastsService,
  areEqualObjects,
  forceObservable,
  onHandlerError,
  removeFirst,
  switchMapWithCancel,
} from '../../utility';
import { DetailState, INITIAL_DETAIL_STATE } from '../detail.state';
import { OperationType, OperationTypeLike } from '../operation-type.enum';
import { OperationWithOptions } from '../operation.type';
import { STORE_HANDLER } from '../store-handler.token';

@Injectable()
export class DetailStoreService<
  Entity extends Record<string, unknown>,
  Keys extends Record<string, string | number>,
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

  itemKeys$ = new Subject<Keys>();

  private keys$ = this.itemKeys$.pipe(distinctUntilChanged(areEqualObjects));

  refresh$ = new Subject<void>();
  operation$ = new Subject<OperationWithOptions<Entity, Keys>>();
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
        mergeMap(([{ operation, options }, keys]) => {
          const canOperate$ = forceObservable(
            // @ts-ignore
            options?.canOperate?.({ operation, item: this.item(), keys }) ||
              true,
          );
          return canOperate$.pipe(
            filter((canOperate) => canOperate),
            switchMap(() => {
              this.addCurrentOperation(operation.type);

              const item = this.item();
              const itemMutation = this.handler.mutateItem?.(operation, item);

              const operation$ = this.handler.operate(operation, item, keys);

              if (!itemMutation) {
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
                // @ts-ignore
                options?.onOperation?.({ operation, item, keys }),
              ),
            ),
            tap(() => this.removeCurrentOperation(operation.type)),
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
