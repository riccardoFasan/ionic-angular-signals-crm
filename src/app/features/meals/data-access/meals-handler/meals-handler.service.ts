import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import { CreateMealFormData, Meal, UpdateMealFormData } from '../meal.model';
import { MealsFacadeService } from '../meals-facade/meals-facade.service';
import { List, SearchCriteria, ToastsService } from 'src/app/shared/utility';
import { Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MealsHandlerService implements StoreHandler<Meal> {
  private mealsFacade = inject(MealsFacadeService);
  private toasts = inject(ToastsService);

  extractId(item: Meal): number {
    return item.id;
  }

  extractName(item: Meal): string {
    return item.name;
  }

  get(id: number): Observable<Meal> {
    return defer(() => this.mealsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Meal>> {
    return defer(() => this.mealsFacade.getList(searchCriteria));
  }

  operate(
    { type, payload }: Operation,
    item?: Meal | undefined,
  ): Observable<Meal> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.mealsFacade.create(payload as CreateMealFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update effects');
        }
        return defer(() =>
          this.mealsFacade.update(item.id, payload as UpdateMealFormData),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.mealsFacade.delete(item.id));

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  mutateItems(
    operation: Operation,
    item: Meal,
    items: Meal[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<Meal> {
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

  onOperation({ type }: Operation, item: Meal): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(
    type: OperationType | string,
    item: Meal,
  ): string | undefined {
    switch (type) {
      case OperationType.Create:
        return `Meal ${item.name} created`;
      case OperationType.Update:
        return `Meal ${item.name} updated`;
      case OperationType.Delete:
        return `Meal ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
