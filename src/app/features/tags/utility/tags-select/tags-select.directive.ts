import { Directive } from '@angular/core';
import { TagsHandlerService } from '../../data-access';
import { STORE_HANDLER } from 'src/app/shared/data-access';

@Directive({
  selector: '[appTagsSelect]',
  standalone: true,
  providers: [{ provide: STORE_HANDLER, useClass: TagsHandlerService }],
})
export class TagsSelectDirective {}
