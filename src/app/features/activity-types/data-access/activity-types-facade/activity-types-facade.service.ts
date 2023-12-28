import { Injectable, inject } from '@angular/core';
import { ActivityTypeApiService, ActivityTypeDTO } from '../database';
import { List } from 'src/app/shared/utility';
import { ActivityType } from '../activity-type.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypesFacadeService {
  private readonly activityTypeApi = inject(ActivityTypeApiService);

  async getList(page: number, pageSize: number): Promise<List<ActivityType>> {
    const list = await this.activityTypeApi.getList(page, pageSize);
    const items = list.items.map((dto) => this.mapFromDTO(dto));
    return { ...list, items };
  }

  async get(id: number): Promise<ActivityType> {
    const dto = await this.activityTypeApi.get(id);
    return this.mapFromDTO(dto);
  }

  async create(name: string, color: string): Promise<ActivityType> {
    const id = await this.activityTypeApi.create(name, color);
    return await this.get(id);
  }

  async update(id: number, name: string, color: string): Promise<ActivityType> {
    await this.activityTypeApi.update(id, name), color;
    return await this.get(id);
  }

  async delete(id: number): Promise<ActivityType> {
    const tag = await this.get(id);
    await this.activityTypeApi.delete(id);
    return tag;
  }

  private mapFromDTO(dto: ActivityTypeDTO): ActivityType {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      name: dto.name,
      icon: dto.icon,
      color: dto.color,
    };
  }
}
