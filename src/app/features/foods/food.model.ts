import { Ingredient } from './ingredient.model';

export type Food = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  ingredients: Ingredient[];
  notes?: string;
};
