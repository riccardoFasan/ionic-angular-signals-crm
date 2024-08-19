import {
  ChangeDetectionStrategy,
  Component,
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
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          @if (loading()) {
            <ion-skeleton-text animated="true" />
          } @else {
            {{ title() }}
          }
        </ion-title>
        <ion-buttons slot="end">
          <ng-content select="[buttons]" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="onIonRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      @if (loading()) {
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
  loading = input<boolean>(false);

  @Output() refresh = new EventEmitter<void>();

  constructor() {
    effect(() => {
      if (this.loading()) return;
      this.ionRefreshEvent?.target.complete();
    });
  }

  private ionRefreshEvent?: RefresherCustomEvent;

  protected onIonRefresh(event: RefresherCustomEvent): void {
    this.ionRefreshEvent = event;
    this.refresh.emit();
  }
}
