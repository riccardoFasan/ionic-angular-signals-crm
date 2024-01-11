import { Injectable, inject } from '@angular/core';
import {
  Operation,
  OperationType,
  StoreHandler,
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
    if (type === OperationType.Create) {
      return defer(() =>
        this.activityTypesFacade.create(payload as CreateActivityTypeFormData),
      );
    }

    if (
      (type === OperationType.Delete || type === OperationType.Update) &&
      !item
    ) {
      throw new Error('Item is required for update and delete effects');
    }

    if (type === OperationType.Update) {
      return defer(() =>
        this.activityTypesFacade.update(
          item!.id,
          payload as UpdateActivityTypeFormData,
        ),
      );
    }

    if (type === OperationType.Delete) {
      return defer(() => this.activityTypesFacade.delete(item!.id));
    }

    throw new Error(`Operation not implemented for: ${type}`);
  }

  onOperation({ type }: Operation, item: ActivityType): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
  }

  private getMessage(
    type: OperationType | string,
    item: ActivityType,
  ): string | undefined {
    if (type === OperationType.Create) {
      return `ActivityType ${item.name} created`;
    }

    if (type === OperationType.Update) {
      return `ActivityType ${item.name} updated`;
    }

    if (type === OperationType.Delete) {
      return `ActivityType ${item.name} deleted`;
    }

    throw new Error(`getMessage not implemented for: ${type}`);
  }
}
