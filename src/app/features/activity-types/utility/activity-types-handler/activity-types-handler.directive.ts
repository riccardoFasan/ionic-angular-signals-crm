import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { ActivityTypesHandlerService } from '../../data-access';

@Directive({
  selector: '[appActivityTypesHandler]',
  standalone: true,
  providers: [
    { provide: STORE_HANDLER, useClass: ActivityTypesHandlerService },
  ],
})
export class ActivityTypesHandlerDirective {}
