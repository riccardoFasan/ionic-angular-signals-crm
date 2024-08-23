import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonItem, IonLabel, IonSkeletonText } from '@ionic/angular/standalone';
import { randomIntegerBetween } from '../../utility';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-skeleton-item',
  standalone: true,
  imports: [IonItem, IonLabel, IonSkeletonText, NgStyle],
  template: `
    <ion-item>
      <ion-skeleton-text [ngStyle]="{ width: width + '%' }" animated />
    </ion-item>
  `,
  styles: `
    ion-skeleton-text {
      height: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonItemComponent {
  protected width = randomIntegerBetween(33, 100);
}
