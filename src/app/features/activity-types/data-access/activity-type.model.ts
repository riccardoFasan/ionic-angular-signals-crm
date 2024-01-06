export type ActivityType = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  icon?: string;
  color?: string;
};

export type CreateActivityTypeFormData = Omit<
  ActivityType,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateActivityTypeFormData = Omit<
  ActivityType,
  'createdAt' | 'updatedAt'
>;
