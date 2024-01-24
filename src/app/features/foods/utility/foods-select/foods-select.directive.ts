import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { FoodsHandlerService } from '../../data-access';

@Directive({
  selector: '[appFoodsSelect]',
  standalone: true,
  providers: [{ provide: STORE_HANDLER, useClass: FoodsHandlerService }],
})
export class FoodsSelectDirective {}
