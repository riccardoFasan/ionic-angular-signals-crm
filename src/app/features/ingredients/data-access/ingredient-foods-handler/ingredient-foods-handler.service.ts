import { Injectable, inject } from '@angular/core';
import { Observable, defer, map } from 'rxjs';
import {
  Food,
  FoodKeys,
  FoodsFacadeService,
} from 'src/app/features/foods/data-access';
import { StoreHandler } from 'src/app/shared/data-access';
import { List, SearchCriteria } from 'src/app/shared/utility';
import { Ingredient } from '../ingredient.model';
import { IngredientsFacadeService } from '../ingredients-facade/ingredients-facade.service';

@Injectable({
  providedIn: 'root',
})
export class IngredientFoodsHandlerService
  implements
    StoreHandler<
      Omit<Food, 'ingredients'>,
      FoodKeys & { ingredientId: number },
      Omit<Food, 'ingredients'>,
      { ingredient: Ingredient }
    >
{
  private ingredientsFacade = inject(IngredientsFacadeService);
  private foodsFacade = inject(FoodsFacadeService);

  extractPk(item: Omit<Food, 'ingredients'>): number {
    return item.id;
  }

  extractName(item: Omit<Food, 'ingredients'>): string {
    return item.name;
  }

  get(): Observable<Omit<Food, 'ingredients'>> {
    throw new Error('Method not implemented.');
  }

  getList(
    searchCriteria: SearchCriteria,
    { ingredientId }: { ingredientId: number },
  ): Observable<List<Omit<Food, 'ingredients'>>> {
    return defer(() =>
      this.foodsFacade.getFoodsOfIngredient(searchCriteria, ingredientId),
    );
  }

  operate(): Observable<Food> {
    throw new Error('Method not implemented.');
  }

  loadRelatedItems({
    ingredientId,
  }: {
    ingredientId: number;
  }): Observable<{ ingredient: Ingredient }> {
    return defer(() => this.ingredientsFacade.get(ingredientId)).pipe(
      map((ingredient) => ({ ingredient })),
    );
  }
}
