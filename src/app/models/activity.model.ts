import { ActivityTag } from './activity-tag.model';
import { ActivityType } from './activity-type.model';

export type Activity = {
  id: number;
  at: Date[];
  type: ActivityType;
  tags: ActivityTag;
  notes?: string;
};
