import { Injectable, inject } from '@angular/core';
import {
  Operation,
  OperationType,
  StoreHandler,
} from 'src/app/shared/data-access';
import { Food, CreateFoodFormData, UpdateFoodFormData } from '../food.model';
import { Observable, defer } from 'rxjs';
import { SearchCriteria, List, ToastsService } from 'src/app/shared/utility';
import { FoodsFacadeService } from '../foods-facade/foods-facade.service';

@Injectable({
  providedIn: 'root',
})
export class FoodsHandlerService implements StoreHandler<Food> {
  private foodsFacade = inject(FoodsFacadeService);
  private toasts = inject(ToastsService);

  extractId(item: Food): number {
    return item.id;
  }

  extractName(item: Food): string {
    return item.name;
  }

  get(id: number): Observable<Food> {
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
          throw new Error('Item is required for update effects');
        }
        return defer(() =>
          this.foodsFacade.update(item.id, payload as UpdateFoodFormData),
        );

      case OperationType.Delete:
        if (!item) {
          throw new Error('Item is required for delete effects');
        }
        return defer(() => this.foodsFacade.delete(item.id));

      default:
        throw new Error(`Operation ${type} not supported.`);
    }
  }

  onOperation({ type }: Operation, item: Food): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
  }

  private getMessage(
    type: OperationType | string,
    item: Food,
  ): string | undefined {
    switch (type) {
      case OperationType.Create:
        return `Food ${item.name} created`;
      case OperationType.Update:
        return `Food ${item.name} updated`;
      case OperationType.Delete:
        return `Food ${item.name} deleted`;
      default:
        throw new Error(`getMessage not implemented for: ${type}`);
    }
  }
}
