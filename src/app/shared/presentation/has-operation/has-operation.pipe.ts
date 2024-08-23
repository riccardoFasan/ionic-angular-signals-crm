import { Pipe, PipeTransform } from '@angular/core';
import { OperationTypeLike } from '../../data-access';
import { ItemOperation } from '../../data-access/item-operation.type';

type ItemOptions<Entity> = {
  item: Entity;
  predicate: (item: Entity) => boolean;
};

@Pipe({
  name: 'hasOperation',
  standalone: true,
})
export class HasOperationPipe implements PipeTransform {
  transform<Entity>(
    operations: (OperationTypeLike | ItemOperation<Entity>)[],
    types: OperationTypeLike | OperationTypeLike[],
    { item, predicate }: Partial<ItemOptions<Entity>> = {},
  ): boolean {
    if ((item && !predicate) || (!item && predicate)) {
      throw new Error(
        'Both item and predicate must be provided or omitted at the same time',
      );
    }

    if (item && predicate) {
      return operations.some((operation) =>
        this.isItemOperation<Entity>(operation)
          ? this.hasOperationTypes(operation.type, types) &&
            (operation.item ? predicate(operation.item!) : true)
          : this.hasOperationTypes(operation, types),
      );
    }

    return operations.some((operation) =>
      this.isItemOperation<Entity>(operation)
        ? this.hasOperationTypes(operation.type, types)
        : this.hasOperationTypes(operation, types),
    );
  }

  private hasOperationTypes(
    type: OperationTypeLike,
    types: OperationTypeLike | OperationTypeLike[],
  ): boolean {
    return Array.isArray(types) ? types.includes(type) : type === types;
  }

  private isItemOperation<Entity>(
    operation: OperationTypeLike | ItemOperation<Entity>,
  ): operation is ItemOperation<Entity> {
    return (operation as ItemOperation<Entity>).item !== undefined;
  }
}
