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
  CreateFoodFormData,
  Food,
  FoodKeys,
  UpdateFoodFormData,
} from '../food.model';
import { FoodsFacadeService } from '../foods-facade/foods-facade.service';
@Injectable({
  providedIn: 'root',
})
export class FoodsHandlerService implements StoreHandler<Food, FoodKeys> {
  private foodsFacade = inject(FoodsFacadeService);

  extractPk(item: Food): number {
    return item.id;
  }

  extractName(item: Food): string {
    return item.name;
  }

  get({ id }: FoodKeys): Observable<Food> {
    return defer(() => this.foodsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Food>> {
    return defer(() => this.foodsFacade.getList(searchCriteria));
  }

  operate(
    { type, payload }: Operation,
    item?: Food | undefined,
  ): Observable<Food> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.foodsFacade.create(payload as CreateFoodFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update operations');
        }
        return defer(() =>
          this.foodsFacade.update(item.id, payload as UpdateFoodFormData),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.foodsFacade.delete(item.id));

      default:
        throw new Error(`Operation ${type} not supported.`);
    }
  }

  mutateItem({ type, payload }: Operation, item: Food): void | Food {
    switch (type) {
      case OperationType.Update:
        if (!item) {
          throw new Error('Item is excpeted after update operation');
        }
        return { ...item, ...(payload as UpdateFoodFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    pages: ItemsPage<Food>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: Food,
  ): void | ItemsMutation<Food> {
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
            { ...item, ...(payload as UpdateFoodFormData) },
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
