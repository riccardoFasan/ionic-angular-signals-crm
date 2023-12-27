import { Food } from '../foods/food.model';

export type Meal = {
  id: number;
  at: Date;
  createdAt: string;
  updatedAt: string;
  name: string;
  consumption: {
    food: Food;
    quantity: number;
  }[];
  notes?: string;
};
