import { Injectable, inject } from '@angular/core';
import { List, SearchCriteria } from 'src/app/shared/utility';
import {
  CreateIngredientFormData,
  Ingredient,
  UpdateIngredientFormData,
} from '../ingredient.model';
import { IngredientApiService, IngredientDTO } from '../database';

@Injectable({
  providedIn: 'root',
})
export class IngredientsFacadeService {
  private ingredientApi = inject(IngredientApiService);

  async getList(searchCriteria: SearchCriteria): Promise<List<Ingredient>> {
    const filters = this.mapToApiFilters(searchCriteria.filters);
    const list = await this.ingredientApi.getList({
      ...searchCriteria,
      filters,
    });
    return { ...list, items: list.items.map(this.mapFromDTO) };
  }

  async get(id: number): Promise<Ingredient> {
    const dto = await this.ingredientApi.get(id);
    return this.mapFromDTO(dto);
  }

  async create(formData: CreateIngredientFormData): Promise<Ingredient> {
    const id = await this.ingredientApi.create(formData.name, formData.notes);
    return await this.get(id);
  }

  async update(
    id: number,
    formData: UpdateIngredientFormData,
  ): Promise<Ingredient> {
    await this.ingredientApi.update(id, formData.name, formData.notes);
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
