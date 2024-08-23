import { Injectable, inject } from '@angular/core';
import {
  ItemsMutation,
  Operation,
  OperationType,
  OperationTypeLike,
  StoreHandler,
  pushSorted,
} from 'src/app/shared/data-access';
import { Food, CreateFoodFormData, UpdateFoodFormData } from '../food.model';
import { Observable, defer } from 'rxjs';
import {
  SearchCriteria,
  List,
  ToastsService,
  AlertsService,
  ItemsPage,
  updateSorted,
  removeSorted,
} from 'src/app/shared/utility';
import { FoodsFacadeService } from '../foods-facade/foods-facade.service';
@Injectable({
  providedIn: 'root',
})
export class FoodsHandlerService implements StoreHandler<Food, { id: number }> {
  private foodsFacade = inject(FoodsFacadeService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  extractPk(item: Food): number {
    return item.id;
  }

  extractName(item: Food): string {
    return item.name;
  }

  get({ id }: { id: number }): Observable<Food> {
    return defer(() => this.foodsFacade.get(id));
  }

  getList(searchCriteria: SearchCriteria): Observable<List<Food>> {
    return defer(() => this.foodsFacade.getList(searchCriteria));
  }

  canOperate({ type }: Operation, item?: Food): boolean | Observable<boolean> {
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
        return { ...item, ...(payload as UpdateFoodFormData) };
    }
  }

  mutateItems(
    { type, payload }: Operation,
    item: Food,
    pages: ItemsPage<Food>[],
    total: number,
    searchCriteria: SearchCriteria,
  ): void | ItemsMutation<Food> {
    switch (type) {
      case OperationType.Create:
        return {
          pages: pushSorted(item, pages, searchCriteria),
          total: total + 1,
        };

      case OperationType.Update:
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
        return {
          pages: removeSorted(item, pages, searchCriteria, (item) => item.id),
          total: total - 1,
        };
    }
  }

  onOperation({ type }: Operation, item: Food): Observable<void> | void {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
  }

  private getMessage(type: OperationTypeLike, item: Food): string | undefined {
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
