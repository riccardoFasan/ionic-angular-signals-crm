export type Ingredient = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  notes?: string;
};

export type IngredientKeys = { id: number };

export type CreateIngredientFormData = Omit<
  Ingredient,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateIngredientFormData = Omit<
  Ingredient,
  'id' | 'createdAt' | 'updatedAt'
>;
