import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-scrollable-list',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    IonList,
    IonItem,
    IonLabel,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
  template: `
    <ion-list>
      @for (item of items; track trackFn(item)) {
        <ng-container
          *ngTemplateOutlet="itemTemplateRef; context: { $implicit: item }"
        />
      }
    </ion-list>

    @if (canLoadNextPage) {
      <ion-infinite-scroll (ionInfinite)="onIonInfinite($event)">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
    }
  `,
  styles: `
    ion-list:empty {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollableListComponent {
  @Input({ required: true }) items: unknown[] = [];
  @Input({ required: true }) trackFn!: (item: any) => string | number;
  @Input() canLoadNextPage: boolean = true;

  @Input({ required: true }) set loading(loading: boolean) {
    if (loading || !this.ionScrollEvent) return;
    this.ionScrollEvent.target.complete();
  }

  @ContentChild('itemTemplate')
  protected itemTemplateRef!: TemplateRef<unknown>;

  @Output() scrollEnd = new EventEmitter<void>();

  private ionScrollEvent?: InfiniteScrollCustomEvent;

  protected onIonInfinite(event: InfiniteScrollCustomEvent): void {
    if (!this.canLoadNextPage) {
      event.target.complete();
      return;
    }
    this.ionScrollEvent = event;
    this.scrollEnd.emit();
  }
}
