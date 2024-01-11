import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-food-form',
  standalone: true,
  imports: [],
  template: ` <p>food-form works!</p> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodFormComponent {}
