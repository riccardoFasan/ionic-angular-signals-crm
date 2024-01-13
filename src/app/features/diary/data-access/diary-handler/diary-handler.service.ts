import { Injectable, inject } from '@angular/core';
import {
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import { Meal } from '../../../meals/data-access/meal.model';
import { Activity } from '../../../activities/data-access/activity.model';
import { Observable } from 'rxjs';
import { SearchCriteria, List } from 'src/app/shared/utility';
import { MealsFacadeService } from '../../../meals/data-access/meals-facade/meals-facade.service';
import { ActivitiesFacadeService } from '../../../activities/data-access/activities-facade/activities-facade.service';

@Injectable({
  providedIn: 'root',
})
export class DiaryHandlerService implements StoreHandler<Meal | Activity> {
  private mealsFacade = inject(MealsFacadeService);
  private activitiesFacade = inject(ActivitiesFacadeService);

  extractId(item: Meal | Activity): number {
    return item.id;
  }

  extractName(item: Meal | Activity): string {
    return item.name;
  }

  get(id: number): Observable<Meal | Activity> {
    throw new Error('Method not implemented.');
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Meal | Activity>> {
    throw new Error('Method not implemented.');
  }

  operate(
    operation: Operation,
    item?: Meal | Activity | undefined,
  ): Observable<Meal | Activity> {
    throw new Error('Method not implemented.');
  }

  onOperation(operation: Operation, item: Meal | Activity): Observable<void> {
    throw new Error('Method not implemented.');
  }

  interpretError?(
    error: Error,
    item?: Meal | Activity | undefined,
  ): string | undefined {
    throw new Error('Method not implemented.');
  }

  private getMessage(
    type: OperationType | string,
    item: Meal | Activity,
  ): string | undefined {
    const itemType = this.isMeal(item) ? 'Meal' : 'Activity';
    switch (type) {
      case OperationType.Create:
        return `${itemType} ${item.name} created`;
      case OperationType.Update:
        return `${itemType} ${item.name} updated`;
      case OperationType.Delete:
        return `${itemType} ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }

  private isMeal(item: Meal | Activity): item is Meal {
    return !!(item as any)['consumptions'];
  }
}
