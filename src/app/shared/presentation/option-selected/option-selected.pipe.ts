import { Pipe, PipeTransform } from '@angular/core';
import { Option } from '../option.model';

@Pipe({
  name: 'optionSelected',
  standalone: true,
})
export class OptionSelectedPipe implements PipeTransform {
  transform(option: Option, selectedOptions: Option[]): boolean {
    return selectedOptions.some(
      (selectedOption) => selectedOption.ref === option.ref,
    );
  }
}
