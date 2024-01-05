import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { Effect, EffectType, StoreHandler } from 'src/app/shared/data-access';
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

  effect({ type, payload }: Effect, item?: Ingredient): Observable<Ingredient> {
    if (type === EffectType.Create) {
      return defer(() =>
        this.ingredientsFacade.create(payload as CreateIngredientFormData),
      );
    }

    if ((type === EffectType.Delete || type === EffectType.Update) && !item) {
      throw new Error('Item is required for update and delete effects');
    }

    if (type === EffectType.Update) {
      return defer(() =>
        this.ingredientsFacade.update(
          item!.id,
          payload as UpdateIngredientFormData,
        ),
      );
    }

    if (type === EffectType.Delete) {
      return defer(() => this.ingredientsFacade.delete(item!.id));
    }

    throw new Error(`Effect not implemented for: ${type}`);
  }

  onEffect({ type }: Effect, item: Ingredient): Observable<void> {
    const message = this.getMessage(type, item);
    return defer(() => this.toasts.success(message));
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

    throw new Error(`getMessage not implemented for: ${type}`);
  }
}
