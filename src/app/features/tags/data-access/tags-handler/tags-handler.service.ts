import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  OperationTypeLike,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import { CreateTagFormData, Tag, UpdateTagFormData } from '../tag.model';
import { Observable, defer } from 'rxjs';
import {
  SearchCriteria,
  List,
  ToastsService,
  AlertsService,
  ItemsPage,
  updateSorted,
  removeSorted,
} from 'src/app/shared/utility';
import { TagsFacadeService } from '../tags-facade/tags-facade.service';

@Injectable({
  providedIn: 'root',
})
export class TagsHandlerService implements StoreHandler<Tag, { id: number }> {
  private tagsFacade = inject(TagsFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  extractPk(item: Tag): number {
    return item.id;
  }

  extractName(item: Tag): string {
    return item.name;
  }

  get({ id }: { id: number }): Observable<Tag> {
    return defer(() => this.tagsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Tag>> {
    return defer(() => this.tagsFacade.getList(searchCriteria));
  }

  canOperate({ type }: Operation, item?: Tag): boolean | Observable<boolean> {
    switch (type) {
      case OperationType.Delete:
        return defer(() =>
          this.alerts.askConfirm(`Are you sure to delete ${item!.name}?`),
        );

      default:
        return true;
    }
  }

  operate({ type, payload }: Operation, item?: Tag): Observable<Tag> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.tagsFacade.create(payload as CreateTagFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update operations');
        }
        return defer(() =>
          this.tagsFacade.update(item.id, payload as UpdateTagFormData),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.tagsFacade.delete(item.id));

      default:
        throw new Error(`Operation not implemented for: ${type}`);
    }
  }

  mutateItem({ type, payload }: Operation, item: Tag): void | Tag {
    switch (type) {
      case OperationType.Update:
        if (!item) {
          throw new Error('Item is excpeted after update operation');
        }
        return { ...item, ...(payload as UpdateTagFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    pages: ItemsPage<Tag>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: Tag,
  ): void | ItemsMutation<Tag> {
    switch (type) {
      case OperationType.Create:
        if (!item) {
          throw new Error('Item is excpeted after create operation');
        }
        return {
          pages: pushSorted(item, pages, searchCriteria),
          total: total + 1,
        };

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is excpeted after update operation');
        }
        return {
          pages: updateSorted(
            { ...item, ...(payload as UpdateTagFormData) },
            pages,
            searchCriteria,
            (item) => item.id,
          ),
          total,
        };

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is excpeted after delete operation');
        }
        return {
          pages: removeSorted(item, pages, searchCriteria, (item) => item.id),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: Tag): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(type: OperationTypeLike, item: Tag): string | undefined {
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
