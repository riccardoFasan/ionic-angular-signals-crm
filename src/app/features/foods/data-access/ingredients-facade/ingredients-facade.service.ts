import { Injectable, inject } from '@angular/core';
import { IngredientApiService, IngredientDTO } from '../database';
import { List } from 'src/app/shared/utility';
import { Ingredient } from '../ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientsFacadeService {
  private readonly ingredientApi = inject(IngredientApiService);

  async getList(page: number, pageSize: number): Promise<List<Ingredient>> {
    const list = await this.ingredientApi.getList(page, pageSize);
    return { ...list, items: list.items.map(this.mapFromDTO) };
  }

  async get(ingredientId: number): Promise<Ingredient> {
    const ingredientDTO = await this.ingredientApi.get(ingredientId);
    return this.mapFromDTO(ingredientDTO);
  }

  async create(name: string, notes?: string): Promise<Ingredient> {
    const ingredientId = await this.ingredientApi.create(name, notes);
    return await this.get(ingredientId);
  }

  async update(
    ingredientId: number,
    name: string,
    notes?: string
  ): Promise<Ingredient> {
    await this.ingredientApi.update(ingredientId, name, notes);
    return await this.get(ingredientId);
  }

  async delete(ingredientId: number): Promise<Ingredient> {
    const ingredient = await this.get(ingredientId);
    await this.ingredientApi.delete(ingredientId);
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
