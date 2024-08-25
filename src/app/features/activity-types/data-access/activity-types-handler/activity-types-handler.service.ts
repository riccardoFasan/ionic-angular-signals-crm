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
  ActivityType,
  ActivityTypeKeys,
  CreateActivityTypeFormData,
  UpdateActivityTypeFormData,
} from '../activity-type.model';
import { ActivityTypesFacadeService } from '../activity-types-facade/activity-types-facade.service';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypesHandlerService
  implements StoreHandler<ActivityType, ActivityTypeKeys>
{
  private activityTypesFacade = inject(ActivityTypesFacadeService);

  extractPk(item: ActivityType): number {
    return item.id;
  }

  extractName(item: ActivityType): string {
    return item.name;
  }

  get({ id }: ActivityTypeKeys): Observable<ActivityType> {
    return defer(() => this.activityTypesFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<ActivityType>> {
    return defer(() => this.activityTypesFacade.getList(searchCriteria));
  }

  operate(
    { type, payload }: Operation,
    item?: ActivityType,
  ): Observable<ActivityType> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.activityTypesFacade.create(
            payload as CreateActivityTypeFormData,
          ),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update operations');
        }
        return defer(() =>
          this.activityTypesFacade.update(
            item.id,
            payload as UpdateActivityTypeFormData,
          ),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.activityTypesFacade.delete(item.id));

      default:
        throw new Error(`Operation ${type} not supported.`);
    }
  }

  mutateItem(
    { type, payload }: Operation,
    item: ActivityType,
  ): void | ActivityType {
    switch (type) {
      case OperationType.Update:
        return { ...item, ...(payload as UpdateActivityTypeFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    pages: ItemsPage<ActivityType>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: ActivityType,
  ): void | ItemsMutation<ActivityType> {
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
            { ...item, ...(payload as UpdateActivityTypeFormData) },
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
