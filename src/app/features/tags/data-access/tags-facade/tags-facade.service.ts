import { Injectable, inject } from '@angular/core';
import { List, SearchCriteria, SearchFilters } from 'src/app/shared/utility';
import { TagApiService, TagDTO } from '../database';
import { CreateTagFormData, Tag, UpdateTagFormData } from '../tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagsFacadeService {
  private tagApi = inject(TagApiService);

  async getList(searchCriteria: SearchCriteria): Promise<List<Tag>> {
    const list = await this.tagApi.getList({
      ...searchCriteria,
      filters: {
        ...searchCriteria.filters,
        query: this.mapToApiFilters(searchCriteria.filters.query),
      },
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
      color: dto.color,
    };
  }

  private mapToApiFilters(
    filters: SearchFilters['query'],
  ): Record<string, string> {
    return {
      ...filters,
      created_at: (filters['createdAt'] as Date)?.toISOString(),
      updated_at: (filters['updatedAt'] as Date)?.toISOString(),
    };
  }
}
