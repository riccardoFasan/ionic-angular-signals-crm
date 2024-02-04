import { Injectable, inject } from '@angular/core';
import {
  ActivityApiService,
  ActivityDTO,
  ActivityTagApiService,
} from '../../../meals/data-access/database';
import {
  ActivityType,
  ActivityTypesFacadeService,
} from 'src/app/features/activity-types/data-access';
import { Tag, TagsFacadeService } from 'src/app/features/tags/data-access';
import {
  Activity,
  CreateActivityFormData,
  UpdateActivityFormData,
} from '../activity.model';
import { List, SearchCriteria, SearchFilters } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesFacadeService {
  private activityApi = inject(ActivityApiService);
  private activityTagApi = inject(ActivityTagApiService);
  private activityTypesFacade = inject(ActivityTypesFacadeService);
  private tagsFacade = inject(TagsFacadeService);

  async getList(searchCriteria: SearchCriteria): Promise<List<Activity>> {
    const filters = this.mapToApiFilters(searchCriteria.filters);
    const list = await this.activityApi.getList({
      ...searchCriteria,
      filters,
    });

    const [activitiesTags, activityTypes] = await Promise.all([
      Promise.all(
        list.items.map((activityDTO) => this.getTags(activityDTO.id)),
      ),
      Promise.all(
        list.items.map((activityDTO) =>
          this.getActivityType(activityDTO.activity_type_id),
        ),
      ),
    ]);

    const items = list.items.map((activityDTO, i) =>
      this.mapFromDTO(activityDTO, activityTypes[i], activitiesTags[i]),
    );

    return { ...list, items };
  }

  async get(id: number): Promise<Activity> {
    const [activityDTO, tags] = await Promise.all([
      this.activityApi.get(id),
      this.getTags(id),
    ]);
    const activityType = await this.getActivityType(
      activityDTO.activity_type_id,
    );
    return this.mapFromDTO(activityDTO, activityType, tags);
  }

  async create({
    name,
    at,
    type,
    tags,
    notes,
    end,
  }: CreateActivityFormData): Promise<Activity> {
    const id = await this.activityApi.create(
      name,
      at.toISOString(),
      type.id,
      notes,
      end && end.toISOString(),
    );

    if (tags) {
      await Promise.all(
        tags.map((tag) => this.activityTagApi.create(id, tag.id)),
      );
    }
    return await this.get(id);
  }

  async update(
    id: number,
    { name, at, type, tags, notes, end }: UpdateActivityFormData,
  ): Promise<Activity> {
    await Promise.all([
      this.activityApi.update(
        id,
        name,
        at.toISOString(),
        type.id,
        notes,
        end && end.toISOString(),
      ),
      this.updateTags(id, tags),
    ]);
    return await this.get(id);
  }

  async delete(id: number): Promise<Activity> {
    const activity = await this.get(id);
    await Promise.all(
      activity.tags.map((tag) => this.activityTagApi.delete(id, tag.id)),
    );
    await this.activityApi.delete(id);
    return activity;
  }

  private async getTags(id: number): Promise<Tag[]> {
    const activityTagDTOs = await this.activityTagApi.getByActivity(id);
    return await Promise.all(
      activityTagDTOs.map((activityTagDTO) =>
        this.tagsFacade.get(activityTagDTO.tag_id),
      ),
    );
  }

  private async getActivityType(activityTypeId: number): Promise<ActivityType> {
    return await this.activityTypesFacade.get(activityTypeId);
  }

  private async updateTags(id: number, tags?: Tag[]): Promise<void> {
    if (!tags || tags.length === 0) return;

    const currentActivityTagDTOs = await this.activityTagApi.getByActivity(id);

    const tagIdsToAdd: number[] = tags.reduce((tagIdsToAdd: number[], tag) => {
      const toAdd = !currentActivityTagDTOs.some(
        (currentActivityTagDTO) => currentActivityTagDTO.tag_id === tag.id,
      );
      if (toAdd) return [...tagIdsToAdd, tag.id];
      return tagIdsToAdd;
    }, []);

    const tagIdsToRemove = currentActivityTagDTOs.reduce(
      (tagIdsToRemove: number[], currentActivityTagDTO) => {
        const toRemove = !tags.some(
          (tag) => tag.id === currentActivityTagDTO.tag_id,
        );

        if (toRemove) return [...tagIdsToRemove, currentActivityTagDTO.tag_id];
        return tagIdsToRemove;
      },
      [],
    );

    await Promise.all([
      tagIdsToAdd.map((tagId) => this.activityTagApi.create(id, tagId)),
      tagIdsToRemove.map((tagId) => this.activityTagApi.delete(id, tagId)),
    ]);
  }

  private mapFromDTO(
    activityDTO: ActivityDTO,
    type: ActivityType,
    tags: Tag[] = [],
  ): Activity {
    return {
      id: activityDTO.id,
      createdAt: new Date(activityDTO.created_at),
      updatedAt: new Date(activityDTO.updated_at),
      name: activityDTO.name,
      at: new Date(activityDTO.at),
      end: activityDTO.end ? new Date(activityDTO.end) : undefined,
      notes: activityDTO.notes,
      type,
      tags,
    };
  }

  private mapToApiFilters(filters: SearchFilters): Record<string, string> {
    return {
      ...filters,
      created_at: (filters['createdAt'] as Date)?.toISOString(),
      updated_at: (filters['updatedAt'] as Date)?.toISOString(),
    };
  }
}
