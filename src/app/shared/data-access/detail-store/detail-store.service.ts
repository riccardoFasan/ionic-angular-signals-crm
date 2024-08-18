import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DetailState, INITIAL_DETAIL_STATE } from '../detail.state';
import {
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
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
  PEntities extends Record<string, unknown> = {},
> {
  private handler = inject(STORE_HANDLER);
  private errorInterpreter = inject(ErrorInterpreterService);
  private toasts = inject(ToastsService);

  private state = signal<DetailState<Entity, PEntities>>(this.initialState);

  item = computed<Entity | undefined>(() => this.state().item);
  parentItems = computed<PEntities | undefined>(() => this.state().parentItems);
  mode = computed<MachineState>(() => this.state().mode);
  error = computed<Error | undefined>(() => this.state().error);

  pk$ = new Subject<unknown>();
  parentKeys$ = new Subject<Record<string, unknown>>();

  private keys$ = combineLatest([
    this.pk$.pipe(startWith(undefined)),
    this.parentKeys$.pipe(startWith({})),
  ]).pipe(distinctUntilChanged(areEqualObjects), debounceTime(50));

  refresh$ = new Subject<void>();
  operation$ = new Subject<Operation>();

  constructor() {
    this.keys$
      .pipe(
        filter(([pk]) => !!pk),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap(([pk, parentKeys]) => {
          const loadEntity$ = this.handler
            // @ts-ignore
            .get(pk, parentKeys)
            .pipe(catchError((error) => onHandlerError(error, this.state)));

          const canLoadParents = !!parentKeys && !!this.handler.loadParents;
          const loadParents$ = forceObservable(
            canLoadParents
              ? // @ts-ignore
                this.handler.loadParents!(parentKeys).pipe(
                  catchError((error) => onHandlerError(error, this.state)),
                )
              : undefined,
          );
          return forkJoin([loadEntity$, loadParents$]);
        }),
        tap(([item, parentItems]) =>
          this.state.update((state) => ({
            ...state,
            item,
            parentItems,
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
        switchMap(([pk, parentKeys]) =>
          this.handler
            // @ts-ignore
            .get(pk, parentKeys)
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
        withLatestFrom(this.keys$),
        mergeMap(([operation, [_, parentKeys]]) => {
          const canOperate$ = forceObservable(
            // @ts-ignore
            this.handler.canOperate?.(operation, this.item(), parentKeys) ||
              true,
          );
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Processing,
          }));
          return canOperate$.pipe(
            filter((canOperate) => canOperate),
            switchMap(() =>
              // @ts-ignore
              this.handler.operate(operation, this.item(), parentKeys).pipe(
                catchError((error) => onHandlerError(error, this.state)),
                map((updatedItem) => ({
                  operation,
                  item: updatedItem || this.item(),
                })),
              ),
            ),
            tap(({ item }) =>
              this.state.update((state) => ({
                ...state,
                item,
                mode: MachineState.Idle,
                error: undefined,
              })),
            ),
            switchMap(({ operation, item }) =>
              forceObservable(
                // @ts-ignore
                this.handler.onOperation?.(operation, item, parentKeys),
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

  private get initialState(): DetailState<Entity, PEntities> {
    return {
      ...INITIAL_DETAIL_STATE,
      ...(this.handler.initialState?.detail || {}),
    };
  }
}
