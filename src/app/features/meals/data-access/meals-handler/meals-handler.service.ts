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
  CreateMealFormData,
  Meal,
  MealKeys,
  UpdateMealFormData,
} from '../meal.model';
import { MealsFacadeService } from '../meals-facade/meals-facade.service';

@Injectable({
  providedIn: 'root',
})
export class MealsHandlerService implements StoreHandler<Meal, MealKeys> {
  private mealsFacade = inject(MealsFacadeService);

  extractPk(item: Meal): number {
    return item.id;
  }

  extractName(item: Meal): string {
    return item.name;
  }

  get({ id }: MealKeys): Observable<Meal> {
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
        if (!item) {
          throw new Error('Item is excpeted after update operation');
        }
        return { ...item, ...(payload as UpdateMealFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    pages: ItemsPage<Meal>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: Meal,
  ): void | ItemsMutation<Meal> {
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
            { ...item, ...(payload as UpdateMealFormData) },
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
