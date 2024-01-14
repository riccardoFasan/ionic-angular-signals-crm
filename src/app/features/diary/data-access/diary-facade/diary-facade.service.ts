import { Injectable, inject } from '@angular/core';
import { DiaryApiService, DiaryEventDTO } from '../database';
import { List, SearchCriteria } from 'src/app/shared/utility';
import { DiaryEvent } from '../diary-event.model';
import { DiaryEventType } from '../diary-event-type.enum';

@Injectable({
  providedIn: 'root',
})
export class DiaryFacadeService {
  private diaryApi = inject(DiaryApiService);

  async getList(searchCriteria: SearchCriteria): Promise<List<DiaryEvent>> {
    const filters = this.mapToApiFilters(searchCriteria.filters);
    const list = await this.diaryApi.getList({
      ...searchCriteria,
      filters,
    });
    return { ...list, items: list.items.map(this.mapFromDTO) };
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

  private mapFromDTO(dto: DiaryEventDTO): DiaryEvent {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      name: dto.name,
      at: new Date(dto.at),
      type: dto.type as DiaryEventType,
      icon: dto.icon,
      color: dto.color,
    };
  }
}
