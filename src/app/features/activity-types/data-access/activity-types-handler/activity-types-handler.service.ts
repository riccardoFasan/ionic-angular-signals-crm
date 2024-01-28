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
import { List, SearchCriteria, ToastsService } from 'src/app/shared/utility';
import { Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypesHandlerService implements StoreHandler<ActivityType> {
  private activityTypesFacade = inject(ActivityTypesFacadeService);
  private toasts = inject(ToastsService);

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
    operation: Operation,
    item: ActivityType,
    items: ActivityType[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<ActivityType> {
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
