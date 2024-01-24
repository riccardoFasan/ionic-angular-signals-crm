import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORE_HANDLER } from '../store-handler.token';
import {
  ErrorInterpreterService,
  SearchCriteria,
  ToastsService,
  onHandlerError,
} from '../../utility';
import {
  INITIAL_LIST_STATE,
  INITIAL_SEARCH_CRITERIA,
  ListState,
} from '../list.state';
import { Subject, catchError, filter, map, merge, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MachineState } from '../machine-state.enum';
import { Operation } from '../operation.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class ListStoreService<T> {
  private handler = inject(STORE_HANDLER);
  private errorInterpreter = inject(ErrorInterpreterService);
  private toasts = inject(ToastsService);

  private state = signal<ListState<T>>(INITIAL_LIST_STATE);

  items = computed<T[]>(() => this.state().items);
  searchCriteria = computed<SearchCriteria>(() => this.state().searchCriteria);
  total = computed<number>(() => this.state().total);
  mode = computed<MachineState>(() => this.state().mode);
  error = computed<Error | undefined>(() => this.state().error);

  private nextPageSearchCriteria = computed<SearchCriteria>(() => {
    const { pagination } = this.searchCriteria();
    const nextPageIndex = pagination.pageIndex + 1;
    return {
      ...this.searchCriteria(),
      pagination: { ...pagination, pageIndex: nextPageIndex },
    };
  });

  canLoadNextPage = computed<boolean>(() => {
    const { pagination } = this.nextPageSearchCriteria();
    const { pageIndex, pageSize } = pagination;
    return pageIndex * pageSize < this.total();
  });

  refresh$ = new Subject<void>();
  loadFirstPage$ = new Subject<void>();
  loadNextPage$ = new Subject<void>();
  filters$ = new Subject<SearchCriteria['filters']>();
  operation$ = new Subject<{ operation: Operation; item?: T }>();
  // TODO: sort

  constructor() {
    merge(this.refresh$, this.loadFirstPage$, this.filters$)
      .pipe(
        takeUntilDestroyed(),
        map((filters) => (filters ? filters : INITIAL_SEARCH_CRITERIA.filters)),
        map((filters) => ({ ...INITIAL_SEARCH_CRITERIA, filters })),
        tap((searchCriteria) =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
            searchCriteria,
          })),
        ),
        switchMap((searchCriteria) =>
          this.handler
            .getList(searchCriteria)
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
        tap(({ items, total }) =>
          this.state.update((state) => ({
            ...state,
            items,
            total,
            mode: MachineState.Idle,
            error: undefined,
          })),
        ),
      )
      .subscribe();

    this.loadNextPage$
      .pipe(
        takeUntilDestroyed(),
        filter(() => this.canLoadNextPage()),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap(() =>
          this.handler
            .getList(this.nextPageSearchCriteria())
            .pipe(catchError((error) => onHandlerError(error, this.state))),
        ),
        tap(({ items }) =>
          this.state.update((state) => ({
            ...state,
            searchCriteria: this.nextPageSearchCriteria(),
            items: [...state.items, ...items],
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
        switchMap(({ operation, item }) =>
          this.handler.operate(operation, item).pipe(
            catchError((error) => onHandlerError(error, this.state)),
            map((item) => [operation, item]),
          ),
        ),
        tap(() =>
          this.state.update((state) => ({
            ...state,
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

      const message =
        this.handler.interpretError?.(error) ||
        this.errorInterpreter.interpretError(error);

      if (!environment.production) console.error({ error, message });
      this.toasts.error(message);
    });
  }
}
