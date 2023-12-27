import { Food } from './food.model';

export type Meal = {
  id: number;
  at: Date;
  consumption: { food: Food; quantity: number }[];
  notes?: string;
};
