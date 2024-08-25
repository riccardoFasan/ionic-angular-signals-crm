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
  CreateIngredientFormData,
  Ingredient,
  IngredientKeys,
  UpdateIngredientFormData,
} from '../ingredient.model';
import { IngredientsFacadeService } from '../ingredients-facade/ingredients-facade.service';

@Injectable({
  providedIn: 'root',
})
export class IngredientsHandlerService
  implements StoreHandler<Ingredient, IngredientKeys>
{
  private ingredientsFacade = inject(IngredientsFacadeService);

  extractPk(item: Ingredient): number {
    return item.id;
  }

  extractName(item: Ingredient): string {
    return item.name;
  }

  get({ id }: IngredientKeys): Observable<Ingredient> {
    return defer(() => this.ingredientsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Ingredient>> {
    return defer(() => this.ingredientsFacade.getList(searchCriteria));
  }

  operate(
    { type, payload }: Operation,
    item?: Ingredient,
  ): Observable<Ingredient> {
    switch (type) {
      case OperationType.Create:
        return defer(() =>
          this.ingredientsFacade.create(payload as CreateIngredientFormData),
        );

      case OperationType.Update:
        if (!item) {
          throw new Error('Item is required for update operations');
        }
        return defer(() =>
          this.ingredientsFacade.update(
            item.id,
            payload as UpdateIngredientFormData,
          ),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete operations');
        }
        return defer(() => this.ingredientsFacade.delete(item.id));

      default:
        throw new Error(`Operation not implemented for: ${type}`);
    }
  }

  mutateItem(
    { type, payload }: Operation,
    item: Ingredient,
  ): void | Ingredient {
    switch (type) {
      case OperationType.Update:
        if (!item) {
          throw new Error('Item is excpeted after update operation');
        }
        return { ...item, ...(payload as UpdateIngredientFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    pages: ItemsPage<Ingredient>[],
    total: number,
    searchCriteria: SearchCriteria,
    item?: Ingredient,
  ): void | ItemsMutation<Ingredient> {
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
            { ...item, ...(payload as UpdateIngredientFormData) },
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
