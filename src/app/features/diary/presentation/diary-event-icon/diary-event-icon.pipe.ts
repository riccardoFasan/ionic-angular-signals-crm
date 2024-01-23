import { Pipe, PipeTransform } from '@angular/core';
import { DiaryEvent, DiaryEventType } from '../../data-access';

@Pipe({
  name: 'diaryEventIcon',
  standalone: true,
})
export class DiaryEventIconPipe implements PipeTransform {
  transform(diaryEvent: DiaryEvent): string {
    const icon = diaryEvent.icon;
    if (icon) return icon;
    return diaryEvent.type === DiaryEventType.Activity
      ? 'calendar-clear'
      : 'pizza';
  }
}
