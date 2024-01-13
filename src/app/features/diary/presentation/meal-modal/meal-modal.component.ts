import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-meal-modal',
  standalone: true,
  imports: [],
  template: `
    <p>
      meal-modal works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealModalComponent {

}
