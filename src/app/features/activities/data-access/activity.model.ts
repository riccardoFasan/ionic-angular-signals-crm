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
  end?: Date;
  notes?: string;
};

export type ActivityKeys = { id: number };

export type CreateActivityFormData = Omit<
  Activity,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateActivityFormData = Omit<
  Activity,
  'id' | 'createdAt' | 'updatedAt'
>;
