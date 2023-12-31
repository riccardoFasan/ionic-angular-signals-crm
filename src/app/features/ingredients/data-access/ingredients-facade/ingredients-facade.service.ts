import { Injectable, inject } from '@angular/core';
import {
  IngredientApiService,
  IngredientDTO,
} from '../../../foods/data-access/database';
import { List } from 'src/app/shared/utility';
import { Ingredient } from '../ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientsFacadeService {
  private ingredientApi = inject(IngredientApiService);

  async getList(page: number, pageSize: number): Promise<List<Ingredient>> {
    const list = await this.ingredientApi.getList(page, pageSize);
    return { ...list, items: list.items.map(this.mapFromDTO) };
  }

  async get(id: number): Promise<Ingredient> {
    const dto = await this.ingredientApi.get(id);
    return this.mapFromDTO(dto);
  }

  async create(name: string, notes?: string): Promise<Ingredient> {
    const id = await this.ingredientApi.create(name, notes);
    return await this.get(id);
  }

  async update(id: number, name: string, notes?: string): Promise<Ingredient> {
    await this.ingredientApi.update(id, name, notes);
    return await this.get(id);
  }

  async delete(id: number): Promise<Ingredient> {
    const ingredient = await this.get(id);
    await this.ingredientApi.delete(id);
    return ingredient;
  }

  private mapFromDTO(dto: IngredientDTO): Ingredient {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      name: dto.name,
      notes: dto.notes,
    };
  }
}
