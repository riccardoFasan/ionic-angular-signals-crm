import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import { CreateTagFormData, Tag, UpdateTagFormData } from '../tag.model';
import { Observable, defer } from 'rxjs';
import { SearchCriteria, List, ToastsService } from 'src/app/shared/utility';
import { TagsFacadeService } from '../tags-facade/tags-facade.service';

@Injectable({
  providedIn: 'root',
})
export class TagsHandlerService implements StoreHandler<Tag> {
  private tagsFacade = inject(TagsFacadeService);
  private toasts = inject(ToastsService);

  extractId(item: Tag): number {
    return item.id;
  }

  extractName(item: Tag): string {
    return item.name;
  }

  get(id: number): Observable<Tag> {
    return defer(() => this.tagsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Tag>> {
    return defer(() => this.tagsFacade.getList(searchCriteria));
  }

  operate({ type, payload }: Operation, item?: Tag): Observable<Tag> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.tagsFacade.create(payload as CreateTagFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update effects');
        }
        return defer(() =>
          this.tagsFacade.update(item.id, payload as UpdateTagFormData),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.tagsFacade.delete(item.id));

      default:
        throw new Error(`Operation not implemented for: ${type}`);
    }
  }

  mutateItems(
    operation: Operation,
    item: Tag,
    items: Tag[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<Tag> {
    switch (operation.type) {
      case OperationType.Create:
        return {
          items: pushSorted(item, items, searchCriteria),
          total: total + 1,
        };

      case OperationType.Update:
        return {
          items: items.map((i) => (i.id === item.id ? item : i)),
          total,
        };

      case OperationType.Delete:
        return {
          items: items.filter((i) => i.id !== item.id),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: Tag): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
  }

  private getMessage(
    type: OperationType | string,
    item: Tag,
  ): string | undefined {
    switch (type) {
      case OperationType.Create:
        return `Tag ${item.name} created`;
      case OperationType.Update:
        return `Tag ${item.name} updated`;
      case OperationType.Delete:
        return `Tag ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
