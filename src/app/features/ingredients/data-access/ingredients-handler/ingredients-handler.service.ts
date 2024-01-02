import { Injectable, inject } from '@angular/core';
import { EffectType, StoreHandler } from 'src/app/shared/data-access';
import { Ingredient } from '../ingredient.model';
import { IngredientsFacadeService } from '../ingredients-facade/ingredients-facade.service';
import { Observable, defer } from 'rxjs';
import { List, SearchCriteria, ToastsService } from 'src/app/shared/utility';
import { Effect } from 'src/app/shared/data-access/effect.type';

type IngredientFormData = Ingredient | Omit<Ingredient, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class IngredientsHandlerService
  implements StoreHandler<Ingredient, IngredientFormData>
{
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
    return defer(() =>
      this.ingredientsFacade.getList(
        searchCriteria.pagination.pageIndex,
        searchCriteria.pagination.pageSize,
      ),
    );
  }

  effect(
    { type, data }: Effect<IngredientFormData>,
    item?: Ingredient,
  ): Observable<Ingredient> {
    if (type === EffectType.Create) {
      return defer(() =>
        this.ingredientsFacade.create(data!.name, data!.notes),
      );
    }

    if ((type === EffectType.Delete || type === EffectType.Update) && !item) {
      throw new Error('Item is required for update and delete effects');
    }

    if (type === EffectType.Update) {
      return defer(() =>
        this.ingredientsFacade.update(item!.id, data!.name, data!.notes),
      );
    }

    if (type === EffectType.Delete) {
      return defer(() => this.ingredientsFacade.delete(item!.id));
    }

    throw new Error(`Effect not implemented for: ${type}`);
  }

  onEffect(
    { type }: Effect<IngredientFormData>,
    item: Ingredient,
  ): Observable<void> {
    const message = this.getMessage(type, item);
    this.toasts.success(message);
    throw new Error(`Effect not implemented for: ${type}`);
  }

  private getMessage(
    type: EffectType | string,
    item: Ingredient,
  ): string | undefined {
    if (type === EffectType.Create) {
      return `Ingredient ${item.name} created`;
    }

    if (type === EffectType.Update) {
      return `Ingredient ${item.name} updated`;
    }

    if (type === EffectType.Delete) {
      return `Ingredient ${item.name} deleted`;
    }

    return;
  }
}
