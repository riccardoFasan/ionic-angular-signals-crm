import { Food } from '../../foods/data-access/food.model';

export type Meal = {
  id: number;
  at: Date;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  consumption: {
    food: Food;
    quantity: number;
  }[];
  notes?: string;
};
