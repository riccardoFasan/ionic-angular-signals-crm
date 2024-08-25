import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { Meal } from '../data-access';

export function mealOperationMessage(
  type: OperationTypeLike,
  item: Meal,
): string {
  switch (type) {
    case OperationType.Create:
      return `Meal ${item.name} created`;
    case OperationType.Update:
      return `Meal ${item.name} updated`;
    case OperationType.Delete:
      return `Meal ${item.name} deleted`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
