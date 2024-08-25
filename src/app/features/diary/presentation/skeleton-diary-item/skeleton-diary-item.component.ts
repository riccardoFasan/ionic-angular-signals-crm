import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { randomIntegerBetween } from 'src/app/shared/utility';

@Component({
  selector: 'app-skeleton-diary-item',
  standalone: true,
  imports: [IonItem, IonLabel, IonSkeletonText, IonThumbnail, NgStyle],
  template: `
    <ion-item>
      <ion-thumbnail slot="start">
        <ion-skeleton-text animated />
      </ion-thumbnail>
      <div>
        <ion-skeleton-text [ngStyle]="{ width: titleWidth + '%' }" animated />
        <ion-skeleton-text [ngStyle]="{ width: labelWidth + '%' }" animated />
      </div>
    </ion-item>
  `,
  styles: `
    ion-thumbnail {
      width: 1.925rem;
      height: 1.925rem;
    }

    div {
      width: 100%;

      ion-skeleton-text:first-child {
        height: 0.85rem;
      }
      ion-skeleton-text:last-child {
        height: 0.725rem;
        margin-top: 0.25rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDiaryItemComponent {
  protected titleWidth = randomIntegerBetween(33, 100);
  protected labelWidth = randomIntegerBetween(33, 100);
}
