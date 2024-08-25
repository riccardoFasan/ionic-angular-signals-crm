import { Ingredient } from '../../ingredients/data-access';

export type Food = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  calories?: number;
  notes?: string;
};

export type FoodKeys = { id: number };

export type CreateFoodFormData = Omit<Food, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateFoodFormData = Omit<Food, 'id' | 'createdAt' | 'updatedAt'>;
