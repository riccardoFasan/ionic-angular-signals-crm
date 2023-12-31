import { Ingredient } from './ingredient.model';

export type Food = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  calories?: number;
  notes?: string;
};
