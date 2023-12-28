import { Injectable, inject } from '@angular/core';
import { IngredientApiService, IngredientDTO } from '../database';
import { List } from 'src/app/shared/utility';
import { Ingredient } from '../ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientsFacadeService {
  private readonly ingredientApi = inject(IngredientApiService);

  async getIngredientList(
    page: number,
    pageSize: number
  ): Promise<List<Ingredient>> {
    const list = await this.ingredientApi.getIngredientList(page, pageSize);
    return { ...list, items: list.items.map(this.mapFromDTO) };
  }

  async getIngredient(ingredientId: number): Promise<Ingredient> {
    const ingredientDTO = await this.ingredientApi.getIngredient(ingredientId);
    return this.mapFromDTO(ingredientDTO);
  }

  async createIngredient(name: string, notes?: string): Promise<Ingredient> {
    const ingredientId = await this.ingredientApi.createIngredient(name, notes);
    return await this.getIngredient(ingredientId);
  }

  async updateIngredient(
    ingredientId: number,
    name: string,
    notes?: string
  ): Promise<Ingredient> {
    await this.ingredientApi.updateIngredient(ingredientId, name, notes);
    return await this.getIngredient(ingredientId);
  }

  async deleteIngredient(ingredientId: number): Promise<Ingredient> {
    const ingredient = await this.getIngredient(ingredientId);
    await this.ingredientApi.deleteIngredient(ingredientId);
    return ingredient;
  }

  private mapFromDTO(ingredientDTO: IngredientDTO): Ingredient {
    return {
      id: ingredientDTO.id,
      createdAt: new Date(ingredientDTO.created_at),
      updatedAt: new Date(ingredientDTO.updated_at),
      name: ingredientDTO.name,
      notes: ingredientDTO.notes,
    };
  }
}
