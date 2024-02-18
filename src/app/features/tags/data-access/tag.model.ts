export type Tag = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  color?: string;
};

export type CreateTagFormData = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTagFormData = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;
