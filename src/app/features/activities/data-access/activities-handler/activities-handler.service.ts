import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import {
  Activity,
  CreateActivityFormData,
  UpdateActivityFormData,
} from '../activity.model';
import { ActivitiesFacadeService } from '../activities-facade/activities-facade.service';
import {
  AlertsService,
  List,
  SearchCriteria,
  ToastsService,
  removeSorted,
  replaceItemInPages,
  ItemsPage,
} from 'src/app/shared/utility';
import { Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesHandlerService
  implements StoreHandler<Activity, { id: number }>
{
  private activitiesFacade = inject(ActivitiesFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  extractPk(item: Activity): number {
    return item.id;
  }

  extractName(item: Activity): string {
    return item.name;
  }

  get({ id }: { id: number }): Observable<Activity> {
    return defer(() => this.activitiesFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Activity>> {
    return defer(() => this.activitiesFacade.getList(searchCriteria));
  }

  canOperate(
    { type }: Operation,
    item?: Activity,
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
        return { ...item, ...(payload as UpdateActivityFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    item: Activity,
    pages: ItemsPage<Activity>[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<Activity> {
    switch (type) {
      case OperationType.Create:
        return {
          pages: pushSorted(item, pages, searchCriteria),
          total: total + 1,
        };

      case OperationType.Update:
        return {
          pages: replaceItemInPages(
            { ...item, ...(payload as UpdateActivityFormData) },
            pages,
            searchCriteria.pagination.pageIndex,
            (item) => item.id,
          ),
          total,
        };

      case OperationType.Delete:
        return {
          pages: removeSorted(
            item,
            pages,
            searchCriteria.pagination,
            (item) => item.id,
          ),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: Activity): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(
    type: OperationType | string,
    item: Activity,
  ): string | undefined {
    switch (type) {
      case OperationType.Create:
        return `Activity "${item.name}" created`;
      case OperationType.Update:
        return `Activity "${item.name}" updated`;
      case OperationType.Delete:
        return `Activity "${item.name}" deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
