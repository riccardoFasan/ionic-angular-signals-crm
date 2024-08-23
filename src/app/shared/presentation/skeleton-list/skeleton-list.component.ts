import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { IonList } from '@ionic/angular/standalone';
import { SkeletonItemComponent } from '../skeleton-item/skeleton-item.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [IonList, SkeletonItemComponent, NgTemplateOutlet],
  template: `
    <ion-list>
      @for (_ of skeletons(); track _) {
        @let skeletonTemplate = skeletonTemplateRef();
        @if (skeletonTemplate) {
          <ng-container *ngTemplateOutlet="skeletonTemplate" />
        } @else {
          <app-skeleton-item />
        }
      }
    </ion-list>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonListComponent {
  size = input.required<number>();

  protected skeletonTemplateRef =
    contentChild<TemplateRef<unknown>>('skeletonTemplate');

  protected skeletons = computed(() => Array.from({ length: this.size() }));
}
