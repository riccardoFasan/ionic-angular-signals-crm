import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { ActivityType } from '../data-access';

export function activityTypeOperationMessage(
  type: OperationTypeLike,
  item: ActivityType,
): string {
  switch (type) {
    case OperationType.Create:
      return `Activity type ${item.name} created`;
    case OperationType.Update:
      return `Activity type ${item.name} updated`;
    case OperationType.Delete:
      return `Activity type ${item.name} deleted`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
