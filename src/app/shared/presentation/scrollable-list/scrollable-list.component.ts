import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Output,
  TemplateRef,
  effect,
  input,
} from '@angular/core';
import {
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  RefresherCustomEvent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-scrollable-list',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    IonList,
    IonRefresher,
    IonInfiniteScroll,
    IonRefresherContent,
    IonInfiniteScrollContent,
    IonSpinner,
  ],
  template: `
    <ion-refresher slot="fixed" (ionRefresh)="onIonRefresh($event)">
      <ion-refresher-content />
    </ion-refresher>

    <ion-list>
      @for (item of items(); track trackFn()(item)) {
        <ng-container
          *ngTemplateOutlet="itemTemplateRef; context: { $implicit: item }"
        />
      }
    </ion-list>

    @if (loading() && !items().length) {
      <div>
        <ion-spinner color="primary" />
      </div>
    }

    @if (canLoadNextPage()) {
      <ion-infinite-scroll (ionInfinite)="onIonInfinite($event)">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
    }
  `,
  styles: `
    ion-list:empty {
      display: none;
    }

    div:has(ion-spinner) {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 25dvh;

      ion-spinner {
        display: block;
        margin: 0 auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollableListComponent {
  items = input.required<unknown[]>();
  trackFn = input.required<(item: any) => string | number>();

  loading = input.required<boolean>();
  canLoadNextPage = input<boolean>(false);

  @ContentChild('itemTemplate')
  protected itemTemplateRef!: TemplateRef<unknown>;

  @Output() scrollEnd = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  constructor() {
    effect(() => {
      if (this.loading()) return;
      this.ionScrollEvent?.target.complete();
      this.ionRefreshEvent?.target.complete();
    });
  }

  private ionScrollEvent?: InfiniteScrollCustomEvent;
  private ionRefreshEvent?: RefresherCustomEvent;

  protected onIonInfinite(event: InfiniteScrollCustomEvent): void {
    if (!this.canLoadNextPage) {
      event.target.complete();
      return;
    }
    this.ionScrollEvent = event;
    this.scrollEnd.emit();
  }

  protected onIonRefresh(event: RefresherCustomEvent): void {
    this.ionRefreshEvent = event;
    this.refresh.emit();
  }
}
