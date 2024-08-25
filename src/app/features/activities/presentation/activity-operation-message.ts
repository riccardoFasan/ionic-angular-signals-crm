import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { Activity } from '../data-access';

export function activityOperationMessage(
  type: OperationTypeLike,
  item: Activity,
): string {
  switch (type) {
    case OperationType.Create:
      return `Activity ${item.name} created`;
    case OperationType.Update:
      return `Activity ${item.name} updated`;
    case OperationType.Delete:
      return `Activity ${item.name} deleted`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
