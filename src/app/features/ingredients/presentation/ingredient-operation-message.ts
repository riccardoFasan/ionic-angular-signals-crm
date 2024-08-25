import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { Ingredient } from '../data-access';

export function ingredientOperationMessage(
  type: OperationTypeLike,
  item: Ingredient,
): string {
  switch (type) {
    case OperationType.Create:
      return `Ingredient ${item.name} created`;
    case OperationType.Update:
      return `Ingredient ${item.name} updated`;
    case OperationType.Delete:
      return `Ingredient ${item.name} deleted`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
