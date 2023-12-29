import { Injectable, inject } from '@angular/core';
import {
  ActivityApiService,
  ActivityDTO,
  ActivityTagApiService,
} from '../database';
import {
  ActivityType,
  ActivityTypesFacadeService,
} from 'src/app/features/activity-types/data-access';
import { Tag, TagsFacadeService } from 'src/app/features/tags/data-access';
import { Activity } from '../activity.model';
import { List } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesFacadeService {
  private activityApi = inject(ActivityApiService);
  private activityTagApi = inject(ActivityTagApiService);
  private activityTypesFacade = inject(ActivityTypesFacadeService);
  private tagsFacade = inject(TagsFacadeService);

  async getList(page: number, pageSize: number): Promise<List<Activity>> {
    const list = await this.activityApi.getList(page, pageSize);

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

  async get(activityId: number): Promise<Activity> {
    const [activityDTO, activityType, tags] = await Promise.all([
      this.activityApi.get(activityId),
      this.getActivityType(activityId),
      this.getTags(activityId),
    ]);
    return this.mapFromDTO(activityDTO, activityType, tags);
  }

  async create(
    name: string,
    at: Date,
    activityType: ActivityType,
    tags?: Tag[],
    notes?: string,
  ): Promise<Activity> {
    const activityId = await this.activityApi.create(
      name,
      at.toISOString(),
      activityType.id,
      notes,
    );

    if (tags) {
      await Promise.all(
        tags.map((tag) => this.activityTagApi.create(activityId, tag.id)),
      );
    }
    return await this.get(activityId);
  }

  async update(
    activityId: number,
    name: string,
    at: Date,
    activityType: ActivityType,
    tags?: Tag[],
    notes?: string,
  ): Promise<Activity> {
    await Promise.all([
      this.activityApi.update(
        activityId,
        name,
        at.toISOString(),
        activityType.id,
        notes,
      ),
      this.updateTags(activityId, tags),
    ]);

    return await this.get(activityId);
  }

  async delete(activityId: number): Promise<Activity> {
    const activity = await this.get(activityId);
    await Promise.all([
      this.activityApi.delete(activityId),
      ...activity.tags.map((tag) =>
        this.activityTagApi.delete(activityId, tag.id),
      ),
    ]);
    return activity;
  }

  private async getTags(activityId: number): Promise<Tag[]> {
    const activityTagDTOs = await this.activityTagApi.getByActivity(activityId);
    return await Promise.all(
      activityTagDTOs.map((activityTagDTO) =>
        this.tagsFacade.get(activityTagDTO.tag_id),
      ),
    );
  }

  private async getActivityType(activityTypeId: number): Promise<ActivityType> {
    return await this.activityTypesFacade.get(activityTypeId);
  }

  private async updateTags(activityId: number, tags?: Tag[]): Promise<void> {
    if (!tags || tags.length === 0) return;

    const currentActivityTagDTOs =
      await this.activityTagApi.getByActivity(activityId);

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
      tagIdsToAdd.map((id) => this.activityTagApi.create(activityId, id)),
      tagIdsToRemove.map((id) => this.activityTagApi.delete(activityId, id)),
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
      notes: activityDTO.notes,
      type,
      tags,
    };
  }
}
