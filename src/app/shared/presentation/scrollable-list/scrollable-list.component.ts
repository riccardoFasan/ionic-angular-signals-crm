import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  computed,
  contentChild,
  effect,
  input,
} from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
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
    IonProgressBar,
  ],
  template: `
    <ion-refresher slot="fixed" (ionRefresh)="onIonRefresh($event)">
      <ion-refresher-content />
    </ion-refresher>

    @if (loading()) {
      <ion-progress-bar type="indeterminate" />
    }

    @if (fetching() && !items().length) {
      <ng-content select="[skeleton]" />
    } @else {
      <ion-list>
        @let itemTemplate = itemTemplateRef();
        @if (itemTemplate) {
          @for (item of items(); track trackFn()(item)) {
            <ng-container
              *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"
            />
          }
        }
      </ion-list>
    }

    @if (canLoadNextPage() && !loading()) {
      <ion-infinite-scroll (ionInfinite)="onIonInfinite($event)">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      position: relative;

      ion-progress-bar {
        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        width: 100%;
      }

      ion-list:empty {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollableListComponent {
  items = input.required<unknown[]>();
  trackFn = input.required<(item: any) => string | number>();

  fetching = input.required<boolean>();
  operating = input<boolean>(false);

  protected loading = computed<boolean>(
    () => this.fetching() || this.operating(),
  );

  canLoadNextPage = input<boolean>(false);

  protected itemTemplateRef =
    contentChild<TemplateRef<unknown>>('itemTemplate');

  @Output() scrollEnd = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  constructor() {
    effect(() => {
      if (this.fetching()) return;
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
