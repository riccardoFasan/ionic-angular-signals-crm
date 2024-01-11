import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import {
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import {
  CreateIngredientFormData,
  Ingredient,
  UpdateIngredientFormData,
} from '../ingredient.model';
import { IngredientsFacadeService } from '../ingredients-facade/ingredients-facade.service';
import { List, SearchCriteria, ToastsService } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class IngredientsHandlerService implements StoreHandler<Ingredient> {
  private ingredientsFacade = inject(IngredientsFacadeService);
  private toasts = inject(ToastsService);

  extractId(item: Ingredient): number {
    return item.id;
  }

  extractName(item: Ingredient): string {
    return item.name;
  }

  get(id: number): Observable<Ingredient> {
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
          throw new Error('Item is required for update effects');
        }
        return defer(() =>
          this.ingredientsFacade.update(
            item.id,
            payload as UpdateIngredientFormData,
          ),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.ingredientsFacade.delete(item.id));

      default:
        throw new Error(`Operation not implemented for: ${type}`);
    }
  }

  onOperation({ type }: Operation, item: Ingredient): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
  }

  private getMessage(
    type: OperationType | string,
    item: Ingredient,
  ): string | undefined {
    switch (type) {
      case OperationType.Create:
        return `Ingredient ${item.name} created`;
      case OperationType.Update:
        return `Ingredient ${item.name} updated`;
      case OperationType.Delete:
        return `Ingredient ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
