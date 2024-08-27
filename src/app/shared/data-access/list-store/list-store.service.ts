import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  mergeMap,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ErrorInterpreterService,
  FilterClause,
  ItemsPage,
  SearchCriteria,
  SearchFilters,
  Sorting,
  areEqualObjects,
  forceObservable,
  getSearchCriteriaWithPage,
  isPageIndexInRange,
  objectArrayUnique,
  onHandlerError,
  pushOrReplace,
  removeFirst,
  switchMapWithCancel,
} from '../../utility';
import { ItemOperation } from '../item-operation.type';
import { ItemsMutation } from '../items-mutation.type';
import { INITIAL_LIST_STATE, ListState } from '../list.state';
import { OperationType, OperationTypeLike } from '../operation-type.enum';
import { Operation, OperationWithOptions } from '../operation.type';
import { STORE_HANDLER } from '../store-handler.token';
import { ToastsService } from '../../presentation';

@Injectable()
export class ListStoreService<
  Entity extends Record<string, unknown>,
  Keys extends Record<string, string | number>,
  REntities extends Record<string, unknown> | undefined = undefined,
> {
  private handler = inject(STORE_HANDLER);
  private errorInterpreter = inject(ErrorInterpreterService);
  private toasts = inject(ToastsService);

  private state = signal<ListState<Entity, REntities>>(this.initialState);

  searchCriteria = computed<SearchCriteria>(() => this.state().searchCriteria);
  total = computed<number>(() => this.state().total);
  error = computed<Error | undefined>(() => this.state().error);

  currentOperations = computed<ItemOperation<Entity>[]>(() =>
    objectArrayUnique(this.state().currentItemOperations),
  );

  items = computed<Entity[]>(() =>
    this.pages()
      .sort((a, b) => a.pageIndex - b.pageIndex)
      .flatMap((page) => page.items),
  );

  relatedItems = computed<REntities | undefined>(
    () => this.state().relatedItems,
  );

  pageItems = computed<Entity[]>(() => {
    const { pagination } = this.searchCriteria();
    const { pageIndex } = pagination;
    const pages = this.pages();
    return pages.find((page) => page.pageIndex === pageIndex)?.items || [];
  });

  canLoadNextPage = computed<boolean>(() => {
    const { total, searchCriteria } = this.state();
    const { pagination } = searchCriteria;
    const { pageIndex, pageSize } = pagination;
    return isPageIndexInRange(pageIndex + 1, pageSize, total);
  });

  private pages = computed<ItemsPage<Entity>[]>(() => this.state().pages);

  refresh$ = new Subject<void>();
  itemOperation$ = new Subject<
    OperationWithOptions<Entity, Keys> & {
      restoreInitialSearchCritieria?: boolean;
      item?: Entity;
    }
  >();

  itemKeys$ = new Subject<Keys>();

  private keys$ = this.itemKeys$.pipe(distinctUntilChanged(areEqualObjects));
  private keysChange$ = this.keys$.pipe(map(() => void 0));

  loadFirstPage$ = new Subject<void>();
  loadPage$ = new Subject<number>();
  loadRelatedItems$ = new Subject<void>();

  params$ = new Subject<SearchCriteria['params']>();
  query$ = new Subject<SearchFilters['query']>();
  filterClause$ = new Subject<FilterClause>();
  sortings$ = new Subject<Sorting[]>();

  private filters$ = combineLatest([this.query$, this.filterClause$]).pipe(
    map(([query, clause]) => ({ query, clause })),
  );

  private searchCriteria$ = combineLatest([
    this.sortings$,
    this.params$,
    this.filters$,
  ]).pipe(
    map(([sortings, params, filters]) => ({ sortings, params, filters })),
    distinctUntilChanged(areEqualObjects),
    startWith(this.initialState.searchCriteria),
  );

  constructor() {
    merge(
      this.refresh$,
      this.loadFirstPage$,
      this.keysChange$,
      this.searchCriteria$,
    )
      .pipe(
        withLatestFrom(this.keys$),
        filter(([_, keys]) => !!keys),
        map(([searchCriteria, keys]) => ({
          searchCriteria: {
            ...this.initialState.searchCriteria,
            ...(searchCriteria || {}),
            pagination: this.initialState.searchCriteria.pagination,
          },
          keys,
        })),
        tap(({ searchCriteria }) =>
          this.state.update((state) => ({ ...state, searchCriteria })),
        ),
        tap(() => this.addCurrentOperation(OperationType.Fetch)),
        switchMapWithCancel(
          ({ searchCriteria, keys }) =>
            this.handler.getList(searchCriteria, keys).pipe(
              catchError((error) => {
                this.removeCurrentOperation(OperationType.Fetch);
                return onHandlerError(error, this.state);
              }),
            ),
          () => this.removeCurrentOperation(OperationType.Fetch),
        ),
        tap(({ items, total }) =>
          this.state.update((state) => ({
            ...state,
            pages: [
              { pageIndex: state.searchCriteria.pagination.pageIndex, items },
            ],
            total,
            error: undefined,
          })),
        ),
        tap(() => this.removeCurrentOperation(OperationType.Fetch)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.loadPage$
      .pipe(
        withLatestFrom(this.keys$),
        filter(
          ([pageIndex, keys]) =>
            !!keys &&
            isPageIndexInRange(
              pageIndex,
              this.searchCriteria().pagination.pageSize,
              this.total(),
            ),
        ),
        map(([pageIndex, keys]) => ({
          searchCriteria: getSearchCriteriaWithPage(
            pageIndex,
            this.searchCriteria(),
          ),
          keys,
        })),
        filter(({ searchCriteria }) => {
          const inCollection = this.pages().some(
            (page) => page.pageIndex === searchCriteria.pagination.pageIndex,
          );
          if (inCollection) {
            this.state.update((state) => ({ ...state, searchCriteria }));
          }
          return !inCollection;
        }),
        tap(() => this.addCurrentOperation(OperationType.Fetch)),
        switchMapWithCancel(
          ({ searchCriteria, keys }) =>
            this.handler.getList(searchCriteria, keys).pipe(
              catchError((error) => {
                this.removeCurrentOperation(OperationType.Fetch);
                return onHandlerError(error, this.state);
              }),
              tap(({ items }) =>
                this.state.update((state) => ({
                  ...state,
                  searchCriteria,
                  pages: pushOrReplace(
                    state.pages,
                    { pageIndex: searchCriteria.pagination.pageIndex, items },
                    (page) =>
                      page.pageIndex === searchCriteria.pagination.pageIndex,
                  ),
                  error: undefined,
                })),
              ),
            ),
          () => this.removeCurrentOperation(OperationType.Fetch),
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

    this.itemOperation$
      .pipe(
        withLatestFrom(this.keys$.pipe(startWith({}))),
        mergeMap(
          ([
            { operation, options, item, restoreInitialSearchCritieria },
            keys,
          ]) => {
            const canOperate$ = forceObservable(
              // @ts-ignore
              options?.canOperate?.({ operation, item, keys }) || true,
            );
            return canOperate$.pipe(
              filter((canOperate) => canOperate),
              switchMap(() => {
                this.addCurrentOperation(operation.type, item);

                // * creation of a new item or operations that do not require a specific item
                if (!item) {
                  return this.operateAndThenMutateOrRefresh(
                    operation,
                    keys,
                    restoreInitialSearchCritieria,
                  );
                }

                const itemsMutation = this.handler.mutateItems?.(
                  operation,
                  this.pages(),
                  this.total(),
                  this.searchCriteria(),
                  item,
                );

                if (!itemsMutation) {
                  return this.handler.operate(operation, item, keys).pipe(
                    catchError((error) => {
                      this.removeCurrentOperation(operation.type, item);
                      return onHandlerError(error, this.state);
                    }),
                    switchMap((updatedItem) =>
                      this.refreshPagesAfterOperation(
                        operation,
                        keys,
                        item,
                        updatedItem,
                        restoreInitialSearchCritieria,
                      ),
                    ),
                  );
                }

                return this.mutatePagesWhileOperating(
                  operation,
                  item,
                  itemsMutation,
                );
              }),
              switchMap(({ operation, item }) =>
                forceObservable(
                  // @ts-ignore
                  options?.onOperation?.({ operation, item, keys }),
                ),
              ),
              tap(() => this.removeCurrentOperation(operation.type, item)),
            );
          },
          environment.operationsConcurrency,
        ),
        takeUntilDestroyed(),
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

  private get initialState(): ListState<Entity, REntities> {
    return {
      ...INITIAL_LIST_STATE,
      ...(this.handler.initialState?.list || {}),
    };
  }

  private operateAndThenMutateOrRefresh(
    operation: Operation,
    keys: Record<string, unknown>,
    restoreInitialSearchCritieria: boolean = false,
  ): Observable<{ operation: Operation; item?: Entity }> {
    return this.handler.operate(operation, keys).pipe(
      catchError((error) => {
        this.removeCurrentOperation(operation.type);
        return onHandlerError(error, this.state);
      }),
      switchMap((item) => {
        const itemsMutation = this.handler.mutateItems?.(
          operation,
          this.pages(),
          this.total(),
          this.searchCriteria(),
          item,
        );

        if (!itemsMutation) {
          return this.refreshPagesAfterOperation(
            operation,
            keys,
            item,
            undefined,
            restoreInitialSearchCritieria,
          );
        }

        const mutate$ = forceObservable(itemsMutation).pipe(
          tap(({ pages, total }) =>
            this.state.update((state) => ({
              ...state,
              pages,
              total,
            })),
          ),
        );

        return mutate$.pipe(
          catchError((error) => {
            this.removeCurrentOperation(operation.type, item);
            return onHandlerError(error, this.state);
          }),
          map(() => ({ item, operation })),
        );
      }),
    );
  }

  private mutatePagesWhileOperating(
    operation: Operation,
    item: Entity,
    itemsMutation: ItemsMutation<Entity>,
  ): Observable<{ operation: Operation; item: Entity }> {
    const { pages: currentPages, total: currentTotal } = this.state();

    const mutate$ = forceObservable(itemsMutation).pipe(
      tap(({ pages, total }) =>
        this.state.update((state) => ({
          ...state,
          pages,
          total,
        })),
      ),
    );

    return combineLatest([this.handler.operate(operation, item), mutate$]).pipe(
      map(([updatedItem]) => ({
        item: updatedItem || item,
        operation,
      })),
      catchError((error) => {
        this.removeCurrentOperation(operation.type, item);
        return onHandlerError(error, this.state, {
          pages: currentPages,
          total: currentTotal,
        });
      }),
    );
  }

  private refreshPagesAfterOperation(
    operation: Operation,
    keys: Record<string, unknown>,
    item?: Entity,
    updatedItem?: Entity,
    restoreInitialSearchCritieria: boolean = false,
  ): Observable<{ operation: Operation; item?: Entity }> {
    const searchCriteria = restoreInitialSearchCritieria
      ? this.initialState.searchCriteria
      : this.searchCriteria();
    return this.handler.getList(searchCriteria, keys).pipe(
      catchError((error) => {
        this.removeCurrentOperation(operation.type, item);
        return onHandlerError(error, this.state);
      }),
      tap(({ items, total }) => {
        const pageIndex = searchCriteria.pagination.pageIndex;
        this.state.update((state) => ({
          ...state,
          searchCriteria,
          pages: pushOrReplace(
            state.pages,
            { pageIndex, items },
            (page) => page.pageIndex === pageIndex,
          ),
          total,
        }));
      }),
      map(() => ({ operation, item: updatedItem || item })),
    );
  }

  private addCurrentOperation(
    operationType: OperationTypeLike,
    item?: Entity,
  ): void {
    this.state.update((state) => ({
      ...state,
      currentItemOperations: [
        ...state.currentItemOperations,
        { type: operationType, item: item || undefined },
      ],
    }));
  }

  private removeCurrentOperation(
    operationType: OperationTypeLike,
    item?: Entity,
  ): void {
    this.state.update((state) => ({
      ...state,
      currentItemOperations: removeFirst(state.currentItemOperations, (o) =>
        areEqualObjects(o, { type: operationType, item: item || undefined }),
      ),
    }));
  }
}
