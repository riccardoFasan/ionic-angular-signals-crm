import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-activity-modal',
  standalone: true,
  imports: [],
  template: ` <p>activity-modal works!</p> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityModalComponent {}
