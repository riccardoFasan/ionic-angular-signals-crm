import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DetailState, INITIAL_DETAIL_STATE } from '../detail.state';
import {
  Subject,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs';
import { STORE_HANDLER } from '../store-handler.token';
import {
  ErrorInterpreterService,
  ToastsService,
  forceObservable,
  onHandlerError,
} from '../../utility';
import { Operation } from '../operation.type';
import { MachineState } from '../machine-state.enum';
import { environment } from 'src/environments/environment';

@Injectable()
export class DetailStoreService<
  Entity extends Record<string, unknown>,
  PEntities extends Record<string, unknown>,
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
  refresh$ = new Subject<void>();
  operation$ = new Subject<Operation>();

  constructor() {
    this.pk$
      .pipe(
        filter((pk) => !!pk),
        distinctUntilChanged(),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap((pk) =>
          this.handler
            .get(pk)
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

    this.refresh$
      .pipe(
        filter(() => !!this.item()),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        map(() => this.handler.extractPk(this.item()!)),
        switchMap((pk) =>
          this.handler
            .get(pk)
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
        mergeMap((operation) => {
          const canOperate$ = forceObservable(
            this.handler.canOperate?.(operation, this.item()) || true,
          );
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Processing,
          }));
          return canOperate$.pipe(
            filter((canOperate) => canOperate),
            switchMap(() =>
              this.handler.operate(operation, this.item()).pipe(
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
              forceObservable(this.handler.onOperation?.(operation, item)),
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
      ...this.handler.initialState?.detail,
    };
  }
}
