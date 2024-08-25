import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { TagsHandlerService } from '../../data-access';

@Directive({
  selector: '[appTagsHandler]',
  standalone: true,
  providers: [{ provide: STORE_HANDLER, useClass: TagsHandlerService }],
})
export class TagsHandlerDirective {}
