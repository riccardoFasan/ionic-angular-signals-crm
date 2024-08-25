import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { Food } from '../data-access';

export function foodOperationMessage(
  type: OperationTypeLike,
  item: Food,
): string {
  switch (type) {
    case OperationType.Create:
      return `Food ${item.name} created`;
    case OperationType.Update:
      return `Food ${item.name} updated`;
    case OperationType.Delete:
      return `Food ${item.name} deleted`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
