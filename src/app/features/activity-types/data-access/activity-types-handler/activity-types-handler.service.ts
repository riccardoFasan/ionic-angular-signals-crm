import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import {
  ActivityType,
  CreateActivityTypeFormData,
  UpdateActivityTypeFormData,
} from '../activity-type.model';
import { ActivityTypesFacadeService } from '../activity-types-facade/activity-types-facade.service';
import {
  AlertsService,
  List,
  SearchCriteria,
  ToastsService,
  removeSorted,
  ItemsPage,
  replaceItemInPages,
} from 'src/app/shared/utility';
import { Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypesHandlerService implements StoreHandler<ActivityType> {
  private activityTypesFacade = inject(ActivityTypesFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  extractId(item: ActivityType): number {
    return item.id;
  }

  extractName(item: ActivityType): string {
    return item.name;
  }

  get(id: number): Observable<ActivityType> {
    return defer(() => this.activityTypesFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<ActivityType>> {
    return defer(() => this.activityTypesFacade.getList(searchCriteria));
  }

  canOperate(
    { type }: Operation,
    item?: ActivityType,
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
          throw new Error('Item is required for update effects');
        }
        return defer(() =>
          this.activityTypesFacade.update(
            item.id,
            payload as UpdateActivityTypeFormData,
          ),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.activityTypesFacade.delete(item.id));

      default:
        throw new Error(`Operation ${type} not supported.`);
    }
  }

  mutateItems(
    { type, payload }: Operation,
    item: ActivityType,
    pages: ItemsPage<ActivityType>[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<ActivityType> {
    switch (type) {
      case OperationType.Create:
        return {
          pages: pushSorted(item, pages, searchCriteria),
          total: total + 1,
        };

      case OperationType.Update:
        return {
          pages: replaceItemInPages(
            { ...(payload as UpdateActivityTypeFormData), ...item },
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

  onOperation(
    { type }: Operation,
    item: ActivityType,
  ): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(
    type: OperationType | string,
    item: ActivityType,
  ): string | undefined {
    switch (type) {
      case OperationType.Create:
        return `ActivityType ${item.name} created`;
      case OperationType.Update:
        return `ActivityType ${item.name} updated`;
      case OperationType.Delete:
        return `ActivityType ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
