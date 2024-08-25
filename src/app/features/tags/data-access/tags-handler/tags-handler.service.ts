import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import {
  ItemsPage,
  List,
  SearchCriteria,
  removeSorted,
  updateSorted,
} from 'src/app/shared/utility';
import {
  CreateTagFormData,
  Tag,
  TagKeys,
  UpdateTagFormData,
} from '../tag.model';
import { TagsFacadeService } from '../tags-facade/tags-facade.service';

@Injectable({
  providedIn: 'root',
})
export class TagsHandlerService implements StoreHandler<Tag, TagKeys> {
  private tagsFacade = inject(TagsFacadeService);

  extractPk(item: Tag): number {
    return item.id;
  }

  extractName(item: Tag): string {
    return item.name;
  }

  get({ id }: TagKeys): Observable<Tag> {
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
}
