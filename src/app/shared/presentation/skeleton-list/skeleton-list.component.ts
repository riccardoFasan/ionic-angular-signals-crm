import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
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
        @if (skeletonTemplateRef) {
          <ng-container *ngTemplateOutlet="skeletonTemplateRef" />
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

  @ContentChild('skeletonTemplate')
  protected skeletonTemplateRef?: TemplateRef<unknown>;

  protected skeletons = computed(() => Array.from({ length: this.size() }));
}
