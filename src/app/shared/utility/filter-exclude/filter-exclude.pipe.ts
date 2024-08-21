import { Pipe, PipeTransform } from '@angular/core';
import { isObjectArray } from '../is-object-array';

@Pipe({
  name: 'filterExclude',
  standalone: true,
})
export class FilterExcludePipe implements PipeTransform {
  transform<T, V = T>(array: T[], value: V, prop?: string): T[] {
    if (isObjectArray(array) && !prop) {
      throw new Error(
        'Property name is required when filtering an array of objects.',
      );
    }

    if (!prop) return array.filter((item) => item !== (value as any));

    return array.filter(
      (item) => (item as Record<string, any>)[prop] !== value,
    );
  }
}
