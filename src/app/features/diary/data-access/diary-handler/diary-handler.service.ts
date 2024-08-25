import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import {
  ItemsPage,
  List,
  SearchCriteria,
  SortOrder,
  removeSorted,
  updateSorted,
} from 'src/app/shared/utility';
import { INITIAL_SEARCH_CRITERIA } from '../../../../shared/data-access/list.state';
import { DiaryEvent, DiaryEventKeys } from '../diary-event.model';
import { DiaryFacadeService } from '../diary-facade/diary-facade.service';

@Injectable({
  providedIn: 'root',
})
export class DiaryHandlerService
  implements StoreHandler<DiaryEvent, DiaryEventKeys>
{
  private diaryFacade = inject(DiaryFacadeService);

  initialState = {
    list: {
      searchCriteria: {
        ...INITIAL_SEARCH_CRITERIA,
        sortings: [{ property: 'at', order: SortOrder.Descending }],
      },
    },
  };

  extractPk(item: DiaryEvent): string {
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
    pages: ItemsPage<DiaryEvent>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: DiaryEvent,
  ): void | ItemsMutation<DiaryEvent> {
    switch (type) {
      case 'REORDER':
        if (!item) {
          throw new Error('Item is excpeted after reorder operation');
        }
        return {
          pages: updateSorted(
            { ...item, at: payload as Date },
            pages,
            searchCriteria,
            (item) => item.ref,
          ),
          total,
        };

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is excpeted after delete operation');
        }
        return {
          pages: removeSorted(item, pages, searchCriteria, (item) => item.ref),
          total: total - 1,
        };
    }
  }
}
