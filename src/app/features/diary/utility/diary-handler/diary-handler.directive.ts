import { Directive } from '@angular/core';
import { STORE_HANDLER } from 'src/app/shared/data-access';
import { DiaryHandlerService } from '../../data-access';

@Directive({
  selector: '[appDiaryHandler]',
  standalone: true,
  providers: [
    {
      provide: STORE_HANDLER,
      useClass: DiaryHandlerService,
    },
  ],
})
export class DiaryHandlerDirective {}
