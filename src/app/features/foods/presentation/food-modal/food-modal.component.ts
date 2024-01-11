import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-food-modal',
  standalone: true,
  imports: [],
  template: ` <p>food-modal works!</p> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodModalComponent {}
