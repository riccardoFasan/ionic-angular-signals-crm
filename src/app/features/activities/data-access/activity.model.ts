import { Tag } from '../../tags/data-access/tag.model';
import { ActivityType } from '../../activity-types/data-access/activity-type.model';

export type Activity = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  at: Date;
  type: ActivityType;
  tags: Tag[];
  notes?: string;
};
