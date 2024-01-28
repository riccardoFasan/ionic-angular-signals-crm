import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import { Observable, defer } from 'rxjs';
import { SearchCriteria, List, ToastsService } from 'src/app/shared/utility';
import { DiaryEvent } from '../diary-event.model';
import { DiaryFacadeService } from '../diary-facade/diary-facade.service';

@Injectable({
  providedIn: 'root',
})
export class DiaryHandlerService implements StoreHandler<DiaryEvent> {
  private diaryFacade = inject(DiaryFacadeService);
  private toasts = inject(ToastsService);

  extractId(item: DiaryEvent): number {
    return item.id;
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

  operate({ type }: Operation, item?: DiaryEvent): Observable<DiaryEvent> {
    switch (type) {
      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.diaryFacade.delete(item.id, item.type));
      default:
        throw new Error(`Operation not implemented for: ${type}`);
    }
  }

  mutateItems(
    operation: Operation,
    item: DiaryEvent,
    items: DiaryEvent[],
    total: number,
  ): void | ItemsMutation<DiaryEvent> {
    switch (operation.type) {
      case OperationType.Delete:
        return {
          items: items.filter((i) => i.id !== item.id),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: DiaryEvent): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
  }

  private getMessage(
    type: OperationType | string,
    item: DiaryEvent,
  ): string | undefined {
    switch (type) {
      case OperationType.Delete:
        return `Event ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
