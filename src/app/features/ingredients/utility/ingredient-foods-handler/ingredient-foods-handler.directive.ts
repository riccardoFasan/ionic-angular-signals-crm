import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { IngredientFoodsHandlerService } from '../../data-access';

@Directive({
  selector: '[appIngredientFoodsHandler]',
  standalone: true,
  providers: [
    { provide: STORE_HANDLER, useClass: IngredientFoodsHandlerService },
  ],
})
export class IngredientFoodsHandlerDirective {}
