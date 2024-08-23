import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  OperationTypeLike,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import { CreateMealFormData, Meal, UpdateMealFormData } from '../meal.model';
import { MealsFacadeService } from '../meals-facade/meals-facade.service';
import {
  AlertsService,
  List,
  SearchCriteria,
  ToastsService,
  removeSorted,
  updateSorted,
  ItemsPage,
} from 'src/app/shared/utility';
import { Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MealsHandlerService implements StoreHandler<Meal, { id: number }> {
  private mealsFacade = inject(MealsFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  extractPk(item: Meal): number {
    return item.id;
  }

  extractName(item: Meal): string {
    return item.name;
  }

  get({ id }: { id: number }): Observable<Meal> {
    return defer(() => this.mealsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Meal>> {
    return defer(() => this.mealsFacade.getList(searchCriteria));
  }

  canOperate({ type }: Operation, item?: Meal): boolean | Observable<boolean> {
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
    item?: Meal | undefined,
  ): Observable<Meal> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.mealsFacade.create(payload as CreateMealFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update operations');
        }
        return defer(() =>
          this.mealsFacade.update(item.id, payload as UpdateMealFormData),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.mealsFacade.delete(item.id));

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  mutateItem({ type, payload }: Operation, item: Meal): void | Meal {
    switch (type) {
      case OperationType.Update:
        return { ...item, ...(payload as UpdateMealFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    item: Meal,
    pages: ItemsPage<Meal>[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<Meal> {
    switch (type) {
      case OperationType.Create:
        return {
          pages: pushSorted(item, pages, searchCriteria),
          total: total + 1,
        };

      case OperationType.Update:
        return {
          pages: updateSorted(
            { ...item, ...(payload as UpdateMealFormData) },
            pages,
            searchCriteria,
            (item) => item.id,
          ),
          total,
        };

      case OperationType.Delete:
        return {
          pages: removeSorted(item, pages, searchCriteria, (item) => item.id),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: Meal): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(type: OperationTypeLike, item: Meal): string | undefined {
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
