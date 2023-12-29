import { Injectable, inject } from '@angular/core';
import { MealApiService, MealDTO, MealFoodApiService } from '../database';
import { FoodsFacadeService } from 'src/app/features/foods/data-access';
import { Meal } from '../meal.model';
import { Consumption } from '../consumption.model';

@Injectable({
  providedIn: 'root',
})
export class MealsFacadeService {
  private mealApi = inject(MealApiService);
  private mealFoodApi = inject(MealFoodApiService);
  private foodsFacade = inject(FoodsFacadeService);

  async getList(page: number, pageSize: number): Promise<Meal[]> {
    const list = await this.mealApi.getList(page, pageSize);
    const mealsConsumptions = await Promise.all(
      list.items.map((mealDTO) => this.getConsumptions(mealDTO.id)),
    );
    const items = list.items.map((mealDTO, i) =>
      this.mapFromDTO(mealDTO, mealsConsumptions[i]),
    );
    return items;
  }

  async get(mealId: number): Promise<Meal> {
    const [mealDTO, consumptions] = await Promise.all([
      this.mealApi.get(mealId),
      this.getConsumptions(mealId),
    ]);
    return this.mapFromDTO(mealDTO, consumptions);
  }

  async create(
    name: string,
    at: Date,
    foods?: Consumption[],
    notes?: string,
  ): Promise<Meal> {
    const mealId = await this.mealApi.create(name, at.toISOString(), notes);
    if (foods) {
      await Promise.all(
        foods.map((consumption) =>
          this.mealFoodApi.create(
            mealId,
            consumption.food.id,
            consumption.quantity,
          ),
        ),
      );
    }
    return await this.get(mealId);
  }

  async delete(mealId: number): Promise<Meal> {
    const meal = await this.get(mealId);
    await Promise.all([
      this.mealApi.delete(mealId),
      ...meal.consumptions.map((consumption) =>
        this.mealFoodApi.delete(mealId, consumption.food.id),
      ),
    ]);
    return meal;
  }

  private async getConsumptions(mealId: number): Promise<Consumption[]> {
    const mealFoodDTOs = await this.mealFoodApi.getByMeal(mealId);
    return Promise.all(
      mealFoodDTOs.map(async (mealfoodDTO) => {
        const food = await this.foodsFacade.get(mealfoodDTO.food_id);
        return { food, quantity: mealfoodDTO.quantity };
      }),
    );
  }

  private async updateConsumptions(
    mealId: number,
    consumptions?: Consumption[],
  ): Promise<void> {
    if (!consumptions || consumptions.length === 0) return;

    const currentMealFoodDTOs = await this.mealFoodApi.getByMeal(mealId);

    const foodIdsAndQuantityToAdd = consumptions.reduce(
      (
        foodIdsAndQuantityToAdd: { id: number; quantity: number }[],
        consumption,
      ) => {
        const toAdd = !currentMealFoodDTOs.some(
          (currentMealFoodDTO) =>
            currentMealFoodDTO.food_id === consumption.food.id,
        );
        if (toAdd)
          return [
            ...foodIdsAndQuantityToAdd,
            { id: consumption.food.id, quantity: consumption.quantity },
          ];
        return foodIdsAndQuantityToAdd;
      },
      [],
    );

    const foodIdsToRemove = currentMealFoodDTOs.reduce(
      (foodIdsToRemove: number[], currentMealFoodDTO) => {
        const toRemove = !consumptions.some(
          (consumption) => consumption.food.id === currentMealFoodDTO.food_id,
        );

        if (toRemove) return [...foodIdsToRemove, currentMealFoodDTO.food_id];
        return foodIdsToRemove;
      },
      [],
    );

    const mealFoodsToUpdate = consumptions.reduce(
      (
        mealFoodsToUpdate: { mealFoodId: number; quantity: number }[],
        consumption,
      ) => {
        const mealFoodDTO = currentMealFoodDTOs.find(
          (currentMealFoodDTO) =>
            currentMealFoodDTO.food_id === consumption.food.id &&
            currentMealFoodDTO.quantity !== consumption.quantity,
        );
        if (mealFoodDTO) {
          return [
            ...mealFoodsToUpdate,
            { mealFoodId: mealFoodDTO.id, quantity: consumption.quantity },
          ];
        }
        return mealFoodsToUpdate;
      },
      [],
    );

    await Promise.all([
      foodIdsAndQuantityToAdd.map(({ id, quantity }) =>
        this.mealFoodApi.create(mealId, id, quantity),
      ),
      foodIdsToRemove.map((id) => this.mealFoodApi.delete(mealId, id)),
      mealFoodsToUpdate.map(({ mealFoodId, quantity }) =>
        this.mealFoodApi.update(mealFoodId, quantity),
      ),
    ]);
  }

  private mapFromDTO(dto: MealDTO, consumptions: Consumption[] = []): Meal {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      at: new Date(dto.at),
      name: dto.name,
      notes: dto.notes,
      consumptions,
    };
  }
}
