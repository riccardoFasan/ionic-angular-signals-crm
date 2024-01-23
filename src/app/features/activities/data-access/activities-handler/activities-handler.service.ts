import { Injectable, inject } from '@angular/core';
import {
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import {
  Activity,
  CreateActivityFormData,
  UpdateActivityFormData,
} from '../activity.model';
import { ActivitiesFacadeService } from '../activities-facade/activities-facade.service';
import { List, SearchCriteria, ToastsService } from 'src/app/shared/utility';
import { Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesHandlerService implements StoreHandler<Activity> {
  private activitiesFacade = inject(ActivitiesFacadeService);
  private toasts = inject(ToastsService);

  extractId(item: Activity): number {
    return item.id;
  }

  extractName(item: Activity): string {
    return item.name;
  }

  get(id: number): Observable<Activity> {
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
          throw new Error('Item is required for update effects');
        }
        return defer(() =>
          this.activitiesFacade.update(
            item.id,
            payload as UpdateActivityFormData,
          ),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.activitiesFacade.delete(item.id));

      default:
        throw new Error('Invalid operation type');
    }
  }

  onOperation({ type }: Operation, item: Activity): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
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
