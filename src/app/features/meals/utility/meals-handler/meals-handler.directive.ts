import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { MealsHandlerService } from '../../data-access';

@Directive({
  selector: '[appMealsHandler]',
  standalone: true,
  providers: [{ provide: STORE_HANDLER, useClass: MealsHandlerService }],
})
export class MealsHandlerDirective {}
