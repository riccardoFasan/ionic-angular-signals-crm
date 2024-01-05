import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORE_HANDLER } from '../store-handler.token';
import { SearchCriteria, ToastsService, onHandlerError } from '../../utility';
import {
  INITIAL_LIST_STATE,
  INITIAL_SEARCH_CRITERIA,
  ListState,
} from '../list.state';
import { Subject, catchError, filter, map, merge, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class ListStoreService<T> {
  private handler = inject(STORE_HANDLER);
  private toasts = inject(ToastsService);

  private state = signal<ListState<T>>(INITIAL_LIST_STATE);

  items = computed<T[]>(() => this.state().items);
  searchCriteria = computed(() => this.state().searchCriteria);
  total = computed<number>(() => this.state().total);
  loading = computed<boolean>(() => this.state().loading);
  error = computed<Error | undefined>(() => this.state().error);

  private nextPageSearchCriteria = computed<SearchCriteria>(() => {
    const { pagination } = this.searchCriteria();
    const nextPageIndex = pagination.pageIndex + 1;
    return {
      ...this.searchCriteria(),
      pagination: { ...pagination, pageIndex: nextPageIndex },
    };
  });

  private canLoadNextPage = computed<boolean>(() => {
    const { pagination } = this.nextPageSearchCriteria();
    const { pageIndex, pageSize } = pagination;
    return pageIndex * pageSize < this.total();
  });

  refresh$ = new Subject<void>();
  loadFirstPage$ = new Subject<void>();
  loadNextPage$ = new Subject<void>();
  filters$ = new Subject<SearchCriteria['filters']>();
  // TODO: single item effect
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
            loading: true,
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
            loading: false,
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
            loading: true,
            searchCriteria: this.nextPageSearchCriteria(),
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
            items: [...state.items, ...items],
            loading: false,
            error: undefined,
          })),
        ),
      )
      .subscribe();

    effect(() => {
      const error = this.error();
      if (!error) return;

      const message = this.handler.interpretError?.(error);
      this.toasts.error(message);
    });
  }
}
