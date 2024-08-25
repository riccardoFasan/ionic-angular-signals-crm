import { OperationType, OperationTypeLike } from 'src/app/shared/data-access';
import { DiaryEvent } from '../data-access';

export function diaryOperationMessage(
  type: OperationTypeLike,
  item: DiaryEvent,
): string {
  switch (type) {
    case OperationType.Delete:
      return `Event ${item.name} deleted`;
    case 'REORDER':
      return `Event ${item.name} reordered`;
    default:
      throw new Error(`getMessage not implemented for: ${type}`);
  }
}
