import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { Tag } from '../data-access';

export function tagOperationMessage(
  type: OperationTypeLike,
  item: Tag,
): string {
  switch (type) {
    case OperationType.Create:
      return `Tag ${item.name} created`;
    case OperationType.Update:
      return `Tag ${item.name} updated`;
    case OperationType.Delete:
      return `Tag ${item.name} deleted`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
