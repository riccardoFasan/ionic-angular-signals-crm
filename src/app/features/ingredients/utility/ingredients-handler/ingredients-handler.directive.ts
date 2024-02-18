import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { IngredientsHandlerService } from '../../data-access';

@Directive({
  selector: '[appIngredientsHandler]',
  standalone: true,
  providers: [{ provide: STORE_HANDLER, useClass: IngredientsHandlerService }],
})
export class IngredientsHandlerDirective {}
