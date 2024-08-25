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
import { ActivitiesFacadeService } from '../activities-facade/activities-facade.service';
import {
  Activity,
  ActivityKeys,
  CreateActivityFormData,
  UpdateActivityFormData,
} from '../activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesHandlerService
  implements StoreHandler<Activity, ActivityKeys>
{
  private activitiesFacade = inject(ActivitiesFacadeService);

  extractPk(item: Activity): number {
    return item.id;
  }

  extractName(item: Activity): string {
    return item.name;
  }

  get({ id }: ActivityKeys): Observable<Activity> {
    return defer(() => this.activitiesFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Activity>> {
    return defer(() => this.activitiesFacade.getList(searchCriteria));
  }

  operate({ type, payload }: Operation, item?: Activity): Observable<Activity> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.activitiesFacade.create(payload as CreateActivityFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update operations');
        }
        return defer(() =>
          this.activitiesFacade.update(
            item.id,
            payload as UpdateActivityFormData,
          ),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.activitiesFacade.delete(item.id));

      default:
        throw new Error('Invalid operation type');
    }
  }

  mutateItem({ type, payload }: Operation, item: Activity): void | Activity {
    switch (type) {
      case OperationType.Update:
        if (!item) {
          throw new Error('Item is excpeted after update operation');
        }
        return { ...item, ...(payload as UpdateActivityFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    pages: ItemsPage<Activity>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: Activity,
  ): void | ItemsMutation<Activity> {
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
            { ...item, ...(payload as UpdateActivityFormData) },
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
