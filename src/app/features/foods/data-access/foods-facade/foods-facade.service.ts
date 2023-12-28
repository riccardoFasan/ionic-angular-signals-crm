import { Injectable, inject } from '@angular/core';
import {
  FoodApiService,
  FoodDTO,
  FoodIngredientApiService,
  IngredientApiService,
  IngredientDTO,
} from '../database';
import { List } from 'src/app/shared/utility';
import { Ingredient } from '../../ingredient.model';
import { Food } from '../../food.model';

@Injectable({
  providedIn: 'root',
})
export class FoodsFacadeService {
  private readonly foodApi = inject(FoodApiService);
  private readonly ingredientApi = inject(IngredientApiService);
  private readonly foodIngredientApi = inject(FoodIngredientApiService);

  async getIngredientList(
    page: number,
    pageSize: number
  ): Promise<List<Ingredient>> {
    const list = await this.ingredientApi.getIngredientList(page, pageSize);
    return { ...list, items: list.items.map(this.mapFromIngredientDto) };
  }

  async getFoodList(page: number, pageSize: number): Promise<List<Food>> {
    const list = await this.foodApi.getFoodList(page, pageSize);
    const ingredientDTOs = await Promise.all(
      list.items.map((foodDTO) => this.getIngredientDTOsOfFood(foodDTO.id))
    );
    const items = list.items.map((foodDTO, i) =>
      this.mapFromFoodDto(foodDTO, ingredientDTOs[i])
    );
    return { ...list, items };
  }

  async getIngredient(ingredientId: number): Promise<Ingredient> {
    const ingredientDTO = await this.ingredientApi.getIngredient(ingredientId);
    return this.mapFromIngredientDto(ingredientDTO);
  }

  async getFood(foodId: number): Promise<Food> {
    const [foodDTO, ingredientDTOs] = await Promise.all([
      this.foodApi.getFood(foodId),
      this.getIngredientDTOsOfFood(foodId),
    ]);
    return this.mapFromFoodDto(foodDTO, ingredientDTOs);
  }

  async createIngredient(name: string, notes?: string): Promise<Ingredient> {
    const ingredientId = await this.ingredientApi.createIngredient(name, notes);
    return await this.getIngredient(ingredientId);
  }

  async createFood(
    name: string,
    ingredients?: Ingredient[],
    notes?: string
  ): Promise<Food> {
    const foodId = await this.foodApi.createFood(name, notes);
    if (ingredients) {
      await Promise.all(
        ingredients.map((ingredient) =>
          this.foodIngredientApi.addIngredientToFood(foodId, ingredient.id)
        )
      );
    }
    return await this.getFood(foodId);
  }

  async updateIngredient(
    ingredientId: number,
    name: string,
    notes?: string
  ): Promise<Ingredient> {
    await this.ingredientApi.updateIngredient(ingredientId, name, notes);
    return await this.getIngredient(ingredientId);
  }

  async updateFood(
    foodId: number,
    name: string,
    ingredients?: Ingredient[],
    notes?: string
  ): Promise<Food> {
    await Promise.all([
      this.foodApi.updateFood(foodId, name, notes),
      this.updateFoodIngredientsRelation(foodId, ingredients),
    ]);

    return await this.getFood(foodId);
  }

  async deleteIngredient(ingredientId: number): Promise<Ingredient> {
    const ingredient = await this.getIngredient(ingredientId);
    await this.ingredientApi.deleteIngredient(ingredientId);
    return ingredient;
  }

  async deleteFood(foodId: number): Promise<Food> {
    const food = await this.getFood(foodId);
    await this.foodApi.deleteFood(foodId);
    return food;
  }

  private async getIngredientDTOsOfFood(
    foodId: number
  ): Promise<IngredientDTO[]> {
    const foodIngredientDTOs =
      await this.foodIngredientApi.getFoodIngredientsOfFood(foodId);
    return await Promise.all(
      foodIngredientDTOs.map((foodIngredientDTO) =>
        this.ingredientApi.getIngredient(foodIngredientDTO.ingredient_id)
      )
    );
  }

  private async updateFoodIngredientsRelation(
    foodId: number,
    ingredients?: Ingredient[]
  ): Promise<void> {
    if (!ingredients || ingredients.length === 0) return;

    const currentFoodIngredientDTOs =
      await this.foodIngredientApi.getFoodIngredientsOfFood(foodId);

    const ingredientIdsToAdd: number[] = ingredients.reduce(
      (ingredientIdsToAdd: number[], ingredient) => {
        const toAdd = !currentFoodIngredientDTOs.some(
          (currentFoodIngredientDTO) =>
            currentFoodIngredientDTO.ingredient_id === ingredient.id
        );
        if (toAdd) return [...ingredientIdsToAdd, ingredient.id];
        return ingredientIdsToAdd;
      },
      []
    );

    const ingredientIdsToRemove = currentFoodIngredientDTOs.reduce(
      (ingredientIdsToRemove: number[], currentFoodIngredientDTO) => {
        const toRemove = !ingredients.some(
          (ingredient) =>
            ingredient.id === currentFoodIngredientDTO.ingredient_id
        );

        if (toRemove)
          return [
            ...ingredientIdsToRemove,
            currentFoodIngredientDTO.ingredient_id,
          ];
        return ingredientIdsToRemove;
      },
      []
    );

    await Promise.all([
      ingredientIdsToAdd.map((id) =>
        this.foodIngredientApi.addIngredientToFood(foodId, id)
      ),
      ingredientIdsToRemove.map((id) =>
        this.foodIngredientApi.removeIngredientFromFood(foodId, id)
      ),
    ]);
  }

  private mapFromIngredientDto(ingredientDTO: IngredientDTO): Ingredient {
    return {
      id: ingredientDTO.id,
      createdAt: new Date(ingredientDTO.created_at),
      updatedAt: new Date(ingredientDTO.updated_at),
      name: ingredientDTO.name,
      notes: ingredientDTO.notes,
    };
  }

  private mapFromFoodDto(
    foodDTO: FoodDTO,
    ingredientDtos: IngredientDTO[]
  ): Food {
    return {
      id: foodDTO.id,
      createdAt: new Date(foodDTO.created_at),
      updatedAt: new Date(foodDTO.updated_at),
      name: foodDTO.name,
      notes: foodDTO.notes,
      ingredients: ingredientDtos.map(this.mapFromIngredientDto),
    };
  }
}
