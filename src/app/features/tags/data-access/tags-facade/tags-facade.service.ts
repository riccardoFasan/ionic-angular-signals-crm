import { Injectable, inject } from '@angular/core';
import { TagApiService, TagDTO } from '../database';
import { Tag } from '../tag.model';
import { List } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class TagsFacadeService {
  private tagApi = inject(TagApiService);

  async getList(pageIndex: number, pageSize: number): Promise<List<Tag>> {
    const list = await this.tagApi.getList(pageIndex, pageSize);
    const items = list.items.map((dto) => this.mapFromDTO(dto));
    return { ...list, items };
  }

  async get(id: number): Promise<Tag> {
    const dto = await this.tagApi.get(id);
    return this.mapFromDTO(dto);
  }

  async create(name: string, color: string): Promise<Tag> {
    const id = await this.tagApi.create(name, color);
    return await this.get(id);
  }

  async update(id: number, name: string, color: string): Promise<Tag> {
    await this.tagApi.update(id, name), color;
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
}
