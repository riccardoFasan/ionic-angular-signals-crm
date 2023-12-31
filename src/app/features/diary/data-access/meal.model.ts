import { Consumption } from './consumption.model';

export type Meal = {
  id: number;
  at: Date;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  consumptions: Consumption[];
  notes?: string;
};
