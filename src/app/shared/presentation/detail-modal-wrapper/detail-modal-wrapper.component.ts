import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EventEmitter,
  input,
  Output,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-detail-modal-wrapper',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    IonProgressBar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          @if (fetching() && !title()) {
            <ion-skeleton-text animated="true" />
          } @else {
            {{ title() }}
          }
        </ion-title>
        <ion-buttons slot="end">
          <ng-content select="[buttons]" />
        </ion-buttons>
        @if (loading()) {
          <ion-progress-bar type="indeterminate" />
        }
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="onIonRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      @if (fetching()) {
        <ion-skeleton-text animated="true" />
        <ion-skeleton-text animated="true" />
        <ion-skeleton-text animated="true" />
      } @else {
        <ng-content />
      }
    </ion-content>
  `,
  styles: `
    :host {
      height: 100%;
    }

    ion-title ion-skeleton-text {
      width: 66%;
      height: 1.25rem;
    }

    ion-content {
      --padding-bottom: 5rem;

      ion-skeleton-text {
        height: 1.5rem;

        &:not(:last-child) {
          margin-bottom: 0.75rem;
        }

        &:nth-child(1) {
          width: 75%;
        }

        &:nth-child(2) {
          width: 66%;
        }

        &:nth-child(3) {
          width: 80%;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailModalWrapperComponent {
  title = input.required<string>();

  fetching = input.required<boolean>();
  operating = input<boolean>(false);

  protected loading = computed<boolean>(
    () => this.fetching() || this.operating(),
  );

  @Output() refresh = new EventEmitter<void>();

  constructor() {
    effect(() => {
      if (this.fetching()) return;
      this.ionRefreshEvent?.target.complete();
    });
  }

  private ionRefreshEvent?: RefresherCustomEvent;

  protected onIonRefresh(event: RefresherCustomEvent): void {
    this.ionRefreshEvent = event;
    this.refresh.emit();
  }
}
