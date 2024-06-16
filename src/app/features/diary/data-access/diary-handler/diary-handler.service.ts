import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import { Observable, defer } from 'rxjs';
import {
  SearchCriteria,
  List,
  ToastsService,
  AlertsService,
  SortOrder,
  ItemsPage,
  removeSorted,
  replaceItemInPages,
} from 'src/app/shared/utility';
import { DiaryEvent } from '../diary-event.model';
import { DiaryFacadeService } from '../diary-facade/diary-facade.service';
import { INITIAL_SEARCH_CRITERIA } from '../../../../shared/data-access/list.state';

@Injectable({
  providedIn: 'root',
})
export class DiaryHandlerService implements StoreHandler<DiaryEvent> {
  private diaryFacade = inject(DiaryFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  initialState = {
    list: {
      searchCriteria: {
        ...INITIAL_SEARCH_CRITERIA,
        sorting: { property: 'at', order: SortOrder.Descending },
      },
    },
  };

  extractId(item: DiaryEvent): string {
    return item.ref;
  }

  extractName(item: DiaryEvent): string {
    return item.name;
  }

  get(): Observable<DiaryEvent> {
    throw new Error('Method not implemented.');
  }

  getList(searchCriteria: SearchCriteria): Observable<List<DiaryEvent>> {
    return defer(() => this.diaryFacade.getList(searchCriteria));
  }

  canOperate(
    { type }: Operation,
    item?: DiaryEvent,
  ): boolean | Observable<boolean> {
    switch (type) {
      case OperationType.Delete:
        return defer(() =>
          this.alerts.askConfirm(`Are you sure to delete ${item!.name}?`),
        );
      default:
        return true;
    }
  }

  operate(
    { type, payload }: Operation,
    item?: DiaryEvent,
  ): Observable<DiaryEvent> {
    switch (type) {
      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.diaryFacade.delete(item.entityId, item.type));
      case 'REORDER':
        return defer(() =>
          this.diaryFacade.reorder(item!.entityId, item!.type, payload as Date),
        );
      default:
        throw new Error(`Operation not implemented for: ${type}`);
    }
  }

  mutateItems(
    { type, payload }: Operation,
    item: DiaryEvent,
    pages: ItemsPage<DiaryEvent>[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<DiaryEvent> {
    switch (type) {
      case 'REORDER':
        return {
          pages: replaceItemInPages(
            { ...item, at: payload as Date },
            pages,
            searchCriteria.pagination.pageIndex,
            (item) => item.ref,
          ),
          total,
        };

      case OperationType.Delete:
        return {
          pages: removeSorted(
            item,
            pages,
            searchCriteria.pagination,
            (item) => item.ref,
          ),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: DiaryEvent): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(
    type: OperationType | string,
    item: DiaryEvent,
  ): string | undefined {
    switch (type) {
      case OperationType.Delete:
        return `Event ${item.name} deleted`;
      case 'REORDER':
        return `Event ${item.name} reordered`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
