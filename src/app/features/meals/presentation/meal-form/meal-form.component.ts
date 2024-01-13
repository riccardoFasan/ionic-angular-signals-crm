import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [],
  template: ` <p>meal-form works!</p> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealFormComponent {}
