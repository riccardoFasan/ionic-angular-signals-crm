import { Tag } from '../tags/tag.model';
import { ActivityType } from '../activity-types/activity-type.model';

export type Activity = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  at: string;
  type: ActivityType;
  tags: Tag;
  notes?: string;
};
