import { Injectable, inject } from '@angular/core';
import { TagApiService, TagDTO } from '../database';
import { CreateTagFormData, Tag, UpdateTagFormData } from '../tag.model';
import { List, SearchCriteria } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class TagsFacadeService {
  private tagApi = inject(TagApiService);

  async getList(searchCriteria: SearchCriteria): Promise<List<Tag>> {
    const filters = this.mapToApiFilters(searchCriteria.filters);
    const list = await this.tagApi.getList({
      ...searchCriteria,
      filters,
    });
    const items = list.items.map((dto) => this.mapFromDTO(dto));
    return { ...list, items };
  }

  async get(id: number): Promise<Tag> {
    const dto = await this.tagApi.get(id);
    return this.mapFromDTO(dto);
  }

  async create({ name, color }: CreateTagFormData): Promise<Tag> {
    const id = await this.tagApi.create(name, color);
    return await this.get(id);
  }

  async update(id: number, { name, color }: UpdateTagFormData): Promise<Tag> {
    await this.tagApi.update(id, name, color);
    return await this.get(id);
  }

  async delete(id: number): Promise<Tag> {
    const tag = await this.get(id);
    await this.tagApi.delete(id);
    return tag;
  }

  private mapFromDTO(dto: TagDTO): Tag {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      name: dto.name,
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
