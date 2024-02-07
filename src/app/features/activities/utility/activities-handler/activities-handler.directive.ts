import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { ActivitiesHandlerService } from '../../data-access';

@Directive({
  selector: '[appActivitiesHandler]',
  standalone: true,
  providers: [{ provide: STORE_HANDLER, useClass: ActivitiesHandlerService }],
})
export class ActivitiesHandlerDirective {}
