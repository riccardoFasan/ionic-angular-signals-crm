import { Ingredient } from './ingredient.model';

export type Food = {
  id: number;
  name: string;
  ingredients: Ingredient[];
  notes?: string;
};
