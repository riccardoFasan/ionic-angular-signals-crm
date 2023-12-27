import { Tag } from '../tags/tag.model';
import { ActivityType } from '../activity-types/activity-type.model';

export type Activity = {
  id: number;
  at: Date[];
  type: ActivityType;
  tags: Tag;
  notes?: string;
};
