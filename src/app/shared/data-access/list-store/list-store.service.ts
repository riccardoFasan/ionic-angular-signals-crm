import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORE_HANDLER } from '../store-handler.token';
import {
  ErrorInterpreterService,
  SearchCriteria,
  SearchFilters,
  Sorting,
  ToastsService,
  isPageIndexInRange,
  forceObservable,
  getSearchCriteriaWithPage,
  onHandlerError,
  pushOrReplace,
  FilterClause,
} from '../../utility';
import { INITIAL_LIST_STATE, ListState } from '../list.state';
import {
  Subject,
  catchError,
  combineLatest,
  filter,
  map,
  merge,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MachineState } from '../machine-state.enum';
import { Operation } from '../operation.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class ListStoreService<T> {
  private handler = inject(STORE_HANDLER);
  private errorInterpreter = inject(ErrorInterpreterService);
  private toasts = inject(ToastsService);

  private state = signal<ListState<T>>(this.initialState);

  searchCriteria = computed<SearchCriteria>(() => this.state().searchCriteria);
  total = computed<number>(() => this.state().total);
  mode = computed<MachineState>(() => this.state().mode);
  error = computed<Error | undefined>(() => this.state().error);

  items = computed<T[]>(() =>
    this.state()
      .pages.sort((a, b) => a.pageIndex - b.pageIndex)
      .map((page) => page.items)
      .flat(),
  );

  pageItems = computed<T[]>(() => {
    const { pagination } = this.searchCriteria();
    const { pageIndex } = pagination;
    const pages = this.state().pages;
    return pages.find((page) => page.pageIndex === pageIndex)?.items || [];
  });

  canLoadNextPage = computed<boolean>(() => {
    const { total, searchCriteria } = this.state();
    const { pagination } = searchCriteria;
    const { pageIndex, pageSize } = pagination;
    return isPageIndexInRange(pageIndex + 1, pageSize, total);
  });

  refresh$ = new Subject<void>();
  loadFirstPage$ = new Subject<void>();
  loadNextPage$ = new Subject<void>();
  loadPage$ = new Subject<number>();
  params$ = new Subject<SearchCriteria['params']>();
  query$ = new Subject<SearchFilters['query']>();
  filterClause$ = new Subject<FilterClause>();
  operation$ = new Subject<{ operation: Operation; item?: T }>();
  sortings$ = new Subject<Sorting[]>();

  private searchCriteria$ = combineLatest([
    this.sortings$,
    this.params$,
    combineLatest([this.query$, this.filterClause$]).pipe(
      map(([query, clause]) => ({ query, clause })),
    ),
  ]).pipe(
    map(([sortings, params, filters]) => ({ sortings, params, filters })),
  );

  constructor() {
    merge(this.refresh$, this.loadFirstPage$, this.searchCriteria$)
      .pipe(
        takeUntilDestroyed(),
        map((searchCriteria) => ({
          ...this.initialState.searchCriteria,
          ...(searchCriteria || {}),
          pagination: this.initialState.searchCriteria.pagination,
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

    this.loadPage$
      .pipe(
        takeUntilDestroyed(),
        filter((pageIndex) =>
          isPageIndexInRange(
            pageIndex,
            this.searchCriteria().pagination.pageSize,
            this.total(),
          ),
        ),
        map((pageIndex) =>
          getSearchCriteriaWithPage(pageIndex, this.searchCriteria()),
        ),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap((searchCriteria) =>
          this.handler.getList(searchCriteria).pipe(
            catchError((error) => onHandlerError(error, this.state)),
            tap(({ items }) =>
              this.state.update((state) => ({
                ...state,
                searchCriteria: searchCriteria,
                pages: pushOrReplace(
                  state.pages,
                  { pageIndex: searchCriteria.pagination.pageSize, items },
                  (page) =>
                    page.pageIndex === searchCriteria.pagination.pageSize,
                ),
                mode: MachineState.Idle,
                error: undefined,
              })),
            ),
          ),
        ),
        // update state definition in order to save the order of item batches, so items and pageItems will be computed from this
        // if it's not in collection, fetch and update the state with searchCriteria and items
        // if it's in collection, just update the state with searchCriteria
      )
      .subscribe();

    this.loadNextPage$
      .pipe(
        takeUntilDestroyed(),
        filter(() => this.canLoadNextPage()),
        map(() => {
          const nextPage = this.searchCriteria().pagination.pageIndex + 1;
          return getSearchCriteriaWithPage(nextPage, this.searchCriteria());
        }),
        tap(() =>
          this.state.update((state) => ({
            ...state,
            mode: MachineState.Fetching,
          })),
        ),
        switchMap((nextPageSearchCriteria) =>
          this.handler.getList(nextPageSearchCriteria).pipe(
            catchError((error) => onHandlerError(error, this.state)),
            tap(({ items }) =>
              this.state.update((state) => ({
                ...state,
                searchCriteria: nextPageSearchCriteria,
                pages: [
                  ...state.pages,
                  {
                    pageIndex: nextPageSearchCriteria.pagination.pageSize,
                    items,
                  },
                ],
                mode: MachineState.Idle,
                error: undefined,
              })),
            ),
          ),
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
            switchMap(() => {
              const mutateItems = this.handler.mutateItems?.(
                operation,
                item,
                this.state().pages,
                this.total(),
                this.searchCriteria(),
              );

              if (!mutateItems) {
                return this.handler.operate(operation, item).pipe(
                  catchError((error) => onHandlerError(error, this.state)),
                  switchMap((item) =>
                    this.handler.getList(this.initialState.searchCriteria).pipe(
                      catchError((error) => onHandlerError(error, this.state)),
                      tap(({ items, total }) => {
                        const initialSearchCriteria =
                          this.initialState.searchCriteria;
                        this.state.update((state) => ({
                          ...state,
                          pages: [
                            {
                              pageIndex:
                                initialSearchCriteria.pagination.pageIndex,
                              items,
                            },
                          ],
                          total,
                          mode: MachineState.Idle,
                          searchCriteria: initialSearchCriteria,
                        }));
                      }),
                      map(() => ({ operation, item })),
                    ),
                  ),
                );
              }

              const { pages: currentPages, total: currentTotal } = this.state();

              const mutate$ = forceObservable(mutateItems).pipe(
                tap(({ pages, total }) =>
                  this.state.update((state) => ({
                    ...state,
                    pages,
                    total,
                    mode: MachineState.Idle,
                  })),
                ),
                map(({ pages, total }) => ({
                  pages,
                  total,
                  operation,
                  item,
                })),
              );

              return combineLatest([
                this.handler.operate(operation, item),
                mutate$,
              ]).pipe(
                map(([item]) => ({ item, operation })),
                catchError((error) =>
                  onHandlerError(error, this.state, {
                    pages: currentPages,
                    total: currentTotal,
                  }),
                ),
              );
            }),
          );
        }),
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

  private get initialState(): ListState<T> {
    return {
      ...INITIAL_LIST_STATE,
      ...this.handler.initialState?.list,
    };
  }
}
