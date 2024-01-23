import { Injectable, inject } from '@angular/core';
import { MealApiService, MealDTO, MealFoodApiService } from '../database';
import { FoodsFacadeService } from 'src/app/features/foods/data-access';
import { CreateMealFormData, Meal, UpdateMealFormData } from '../meal.model';
import { Consumption } from '../consumption.model';
import { List, SearchCriteria } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class MealsFacadeService {
  private mealApi = inject(MealApiService);
  private mealFoodApi = inject(MealFoodApiService);
  private foodsFacade = inject(FoodsFacadeService);

  async getList(searchCriteria: SearchCriteria): Promise<List<Meal>> {
    const filters = this.mapToApiFilters(searchCriteria.filters);
    const list = await this.mealApi.getList({
      ...searchCriteria,
      filters,
    });
    const mealsConsumptions = await Promise.all(
      list.items.map((mealDTO) => this.getConsumptions(mealDTO.id)),
    );
    const items = list.items.map((mealDTO, i) =>
      this.mapFromDTO(mealDTO, mealsConsumptions[i]),
    );
    return { ...list, items };
  }

  async get(id: number): Promise<Meal> {
    const [mealDTO, consumptions] = await Promise.all([
      this.mealApi.get(id),
      this.getConsumptions(id),
    ]);
    return this.mapFromDTO(mealDTO, consumptions);
  }

  async create({
    name,
    at,
    consumptions,
    notes,
  }: CreateMealFormData): Promise<Meal> {
    const id = await this.mealApi.create(name, at.toISOString(), notes);
    if (consumptions) {
      await Promise.all(
        consumptions.map((consumption) =>
          this.mealFoodApi.create(
            id,
            consumption.food.id,
            consumption.quantity,
          ),
        ),
      );
    }
    return await this.get(id);
  }

  async update(
    id: number,
    { name, at, consumptions, notes }: UpdateMealFormData,
  ): Promise<Meal> {
    await Promise.all([
      this.mealApi.update(id, name, at.toISOString(), notes),
      this.updateConsumptions(id, consumptions),
    ]);
    return await this.get(id);
  }

  async delete(id: number): Promise<Meal> {
    const meal = await this.get(id);
    await Promise.all(
      meal.consumptions.map((consumption) =>
        this.mealFoodApi.delete(id, consumption.food.id),
      ),
    );
    await this.mealApi.delete(id);
    return meal;
  }

  private async getConsumptions(id: number): Promise<Consumption[]> {
    const mealFoodDTOs = await this.mealFoodApi.getByMeal(id);
    return Promise.all(
      mealFoodDTOs.map(async (mealfoodDTO) => {
        const food = await this.foodsFacade.get(mealfoodDTO.food_id);
        return { food, quantity: mealfoodDTO.quantity };
      }),
    );
  }

  private async updateConsumptions(
    id: number,
    consumptions?: Consumption[],
  ): Promise<void> {
    if (!consumptions || consumptions.length === 0) return;

    const currentMealFoodDTOs = await this.mealFoodApi.getByMeal(id);

    const foodIdsAndQuantityToAdd = consumptions.reduce(
      (
        foodIdsAndQuantityToAdd: { foodId: number; quantity: number }[],
        consumption,
      ) => {
        const toAdd = !currentMealFoodDTOs.some(
          (currentMealFoodDTO) =>
            currentMealFoodDTO.food_id === consumption.food.id,
        );
        if (toAdd)
          return [
            ...foodIdsAndQuantityToAdd,
            { foodId: consumption.food.id, quantity: consumption.quantity },
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
      foodIdsAndQuantityToAdd.map(({ foodId, quantity }) =>
        this.mealFoodApi.create(id, foodId, quantity),
      ),
      foodIdsToRemove.map((foodId) => this.mealFoodApi.delete(id, foodId)),
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

  private mapToApiFilters(
    filters: SearchCriteria['filters'],
  ): Record<string, string> {
    return {
      ...filters,
      created_at: (filters['createdAt'] as Date)?.toISOString(),
      updated_at: (filters['updatedAt'] as Date)?.toISOString(),
    };
  }
}
