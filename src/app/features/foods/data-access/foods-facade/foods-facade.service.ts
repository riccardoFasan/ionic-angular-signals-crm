import { Injectable, inject } from '@angular/core';
import { FoodApiService, FoodDTO, FoodIngredientApiService } from '../database';
import { List } from 'src/app/shared/utility';
import { Ingredient } from '../ingredient.model';
import { Food } from '../food.model';
import { IngredientsFacadeService } from '../ingredients-facade/ingredients-facade.service';

@Injectable({
  providedIn: 'root',
})
export class FoodsFacadeService {
  private foodApi = inject(FoodApiService);
  private foodIngredientApi = inject(FoodIngredientApiService);
  private ingredientsFacade = inject(IngredientsFacadeService);

  async getList(page: number, pageSize: number): Promise<List<Food>> {
    const list = await this.foodApi.getList(page, pageSize);
    const foodsIngredients = await Promise.all(
      list.items.map((foodDTO) => this.getIngredients(foodDTO.id)),
    );
    const items = list.items.map((foodDTO, i) =>
      this.mapFromDTO(foodDTO, foodsIngredients[i]),
    );
    return { ...list, items };
  }

  async get(foodId: number): Promise<Food> {
    const [foodDTO, ingredients] = await Promise.all([
      this.foodApi.get(foodId),
      this.getIngredients(foodId),
    ]);
    return this.mapFromDTO(foodDTO, ingredients);
  }

  async create(
    name: string,
    ingredients?: Ingredient[],
    notes?: string,
  ): Promise<Food> {
    const foodId = await this.foodApi.create(name, notes);
    if (ingredients) {
      await Promise.all(
        ingredients.map((ingredient) =>
          this.foodIngredientApi.create(foodId, ingredient.id),
        ),
      );
    }
    return await this.get(foodId);
  }

  async update(
    foodId: number,
    name: string,
    ingredients?: Ingredient[],
    notes?: string,
  ): Promise<Food> {
    await Promise.all([
      this.foodApi.update(foodId, name, notes),
      this.updateIngredients(foodId, ingredients),
    ]);

    return await this.get(foodId);
  }

  async delete(foodId: number): Promise<Food> {
    const food = await this.get(foodId);
    await Promise.all([
      this.foodApi.delete(foodId),
      ...food.ingredients.map((ingredient) =>
        this.foodIngredientApi.delete(foodId, ingredient.id),
      ),
    ]);
    return food;
  }

  private async getIngredients(foodId: number): Promise<Ingredient[]> {
    const foodIngredientDTOs = await this.foodIngredientApi.getByFood(foodId);
    return await Promise.all(
      foodIngredientDTOs.map((foodIngredientDTO) =>
        this.ingredientsFacade.get(foodIngredientDTO.ingredient_id),
      ),
    );
  }

  private async updateIngredients(
    foodId: number,
    ingredients?: Ingredient[],
  ): Promise<void> {
    if (!ingredients || ingredients.length === 0) return;

    const currentFoodIngredientDTOs =
      await this.foodIngredientApi.getByFood(foodId);

    const ingredientIdsToAdd: number[] = ingredients.reduce(
      (ingredientIdsToAdd: number[], ingredient) => {
        const toAdd = !currentFoodIngredientDTOs.some(
          (currentFoodIngredientDTO) =>
            currentFoodIngredientDTO.ingredient_id === ingredient.id,
        );
        if (toAdd) return [...ingredientIdsToAdd, ingredient.id];
        return ingredientIdsToAdd;
      },
      [],
    );

    const ingredientIdsToRemove = currentFoodIngredientDTOs.reduce(
      (ingredientIdsToRemove: number[], currentFoodIngredientDTO) => {
        const toRemove = !ingredients.some(
          (ingredient) =>
            ingredient.id === currentFoodIngredientDTO.ingredient_id,
        );

        if (toRemove)
          return [
            ...ingredientIdsToRemove,
            currentFoodIngredientDTO.ingredient_id,
          ];
        return ingredientIdsToRemove;
      },
      [],
    );

    await Promise.all([
      ingredientIdsToAdd.map((id) => this.foodIngredientApi.create(foodId, id)),
      ingredientIdsToRemove.map((id) =>
        this.foodIngredientApi.delete(foodId, id),
      ),
    ]);
  }

  private mapFromDTO(foodDTO: FoodDTO, ingredients: Ingredient[] = []): Food {
    return {
      id: foodDTO.id,
      createdAt: new Date(foodDTO.created_at),
      updatedAt: new Date(foodDTO.updated_at),
      name: foodDTO.name,
      notes: foodDTO.notes,
      ingredients,
    };
  }
}
