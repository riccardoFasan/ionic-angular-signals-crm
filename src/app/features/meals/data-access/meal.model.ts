import { Consumption } from './consumption.model';

export type Meal = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  at: Date;
  consumptions: Consumption[];
  notes?: string;
};

export type MealKeys = { id: number };

export type CreateMealFormData = Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateMealFormData = Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>;
