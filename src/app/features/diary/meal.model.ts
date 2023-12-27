import { Food } from '../foods/food.model';

export type Meal = {
  id: number;
  at: Date;
  consumption: {
    food: Food;
    quantity: number;
  }[];
  notes?: string;
};
