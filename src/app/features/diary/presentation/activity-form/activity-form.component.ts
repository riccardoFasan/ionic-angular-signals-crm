import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [],
  template: `
    <p>
      activity-form works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFormComponent {

}
