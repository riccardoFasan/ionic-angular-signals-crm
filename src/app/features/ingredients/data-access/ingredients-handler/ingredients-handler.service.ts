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
  CreateIngredientFormData,
  Ingredient,
  UpdateIngredientFormData,
} from '../ingredient.model';
import { IngredientsFacadeService } from '../ingredients-facade/ingredients-facade.service';
import {
  AlertsService,
  List,
  SearchCriteria,
  ToastsService,
} from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class IngredientsHandlerService implements StoreHandler<Ingredient> {
  private ingredientsFacade = inject(IngredientsFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

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

  canOperate(
    { type }: Operation,
    item?: Ingredient,
  ): boolean | Observable<boolean> {
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

  mutateItems(
    operation: Operation,
    item: Ingredient,
    items: Ingredient[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<Ingredient> {
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

  onOperation({ type }: Operation, item: Ingredient): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
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
