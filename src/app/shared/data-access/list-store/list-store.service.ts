import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORE_HANDLER } from '../store-handler.token';
import {
  ErrorInterpreterService,
  SearchCriteria,
  SearchFilters,
  ToastsService,
  forceObservable,
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
  filters$ = new Subject<SearchFilters>();
  operation$ = new Subject<{ operation: Operation; item?: T }>();
  // TODO: sort

  constructor() {
    // refresh will reset paginations and filters because we're in an app
    // with infinite scroll,
    // if we were in a desktop crud app it would kept the current search criteria,
    // so it would be a different reducer

    merge(this.refresh$, this.loadFirstPage$, this.filters$)
      .pipe(
        takeUntilDestroyed(),
        map((filters) => ({
          ...INITIAL_SEARCH_CRITERIA,
          filters: filters || INITIAL_SEARCH_CRITERIA.filters,
        })),
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
        switchMap(({ operation, item }) => {
          const canOperate$ = forceObservable(
            this.handler.canOperate?.(operation, item) || true,
          );
          return canOperate$.pipe(
            filter((canOperate) => canOperate),
            switchMap(() =>
              this.handler.operate(operation, item).pipe(
                catchError((error) => onHandlerError(error, this.state)),
                map((item) => ({ operation, item })),
              ),
            ),
          );
        }),
        switchMap(({ operation, item }) => {
          const mutateItems = this.handler.mutateItems?.(
            operation,
            item,
            this.items(),
            this.total(),
            this.searchCriteria(),
          );

          if (!mutateItems) {
            return this.handler.getList(INITIAL_SEARCH_CRITERIA).pipe(
              catchError((error) => onHandlerError(error, this.state)),
              map(({ items, total }) => ({ items, total, operation, item })),
              tap(() =>
                this.state.update((state) => ({
                  ...state,
                  searchCriteria: INITIAL_SEARCH_CRITERIA,
                })),
              ),
            );
          }

          return forceObservable(mutateItems).pipe(
            map(({ items, total }) => ({ items, total, operation, item })),
            catchError((error) => onHandlerError(error, this.state)),
          );
        }),
        tap(({ items, total }) =>
          this.state.update((state) => ({
            ...state,
            items,
            total,
            mode: MachineState.Idle,
            error: undefined,
          })),
        ),
        switchMap(({ operation, item }) =>
          forceObservable(this.handler.onOperation?.(operation, item)),
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
