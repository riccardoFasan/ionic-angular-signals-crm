import { Component, OnInit, computed, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonFabButton,
  IonFab,
  IonIcon,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
} from '@ionic/angular/standalone';
import {
  ListStoreService,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import { ActivityType } from '../data-access';
import { ScrollableListComponent } from 'src/app/shared/presentation';
import {
  ActivityTypesHandlerDirective,
  ActivityTypesModalsService,
} from '../utility';

@Component({
  selector: 'app-activity-types',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonFabButton,
    IonFab,
    IonIcon,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    ScrollableListComponent,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>Activity Types</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Activity Types</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-scrollable-list
        [items]="listStore.items()"
        [canLoadNextPage]="listStore.canLoadNextPage()"
        [loading]="listStore.mode() === 'FETCHING'"
        [trackFn]="trackFn"
        (scrollEnd)="listStore.loadPage$.next(nextPage())"
        (refresh)="listStore.refresh$.next()"
      >
        <ng-template #itemTemplate let-item>
          <ion-item-sliding #itemSliding>
            <ion-item>
              <ion-label>{{ item.name }}</ion-label>
            </ion-item>

            <ion-item-options side="start">
              <ion-item-option
                (click)="[remove(item), itemSliding.close()]"
                color="danger"
              >
                Delete
              </ion-item-option>
            </ion-item-options>
            <ion-item-options side="end">
              <ion-item-option
                (click)="[openModal(item.id), itemSliding.close()]"
              >
                Edit
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ng-template>
      </app-scrollable-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="openModal()">
          <ion-icon name="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  hostDirectives: [ActivityTypesHandlerDirective],
  providers: [ListStoreService],
  styles: [``],
})
export class ActivityTypesPage implements OnInit {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);
  protected activityTypeModals = inject(ActivityTypesModalsService);

  protected nextPage = computed<number>(
    () => this.listStore.searchCriteria().pagination.pageIndex + 1,
  );

  protected trackFn = (item: ActivityType): number | string =>
    this.storeHandler.extractId(item);

  ngOnInit(): void {
    this.listStore.loadFirstPage$.next();
  }

  protected remove(item: ActivityType): void {
    this.listStore.operation$.next({
      operation: { type: OperationType.Delete },
      item,
    });
  }

  protected async openModal(id?: number): Promise<void> {
    await this.activityTypeModals.openModal(id);
    this.listStore.refresh$.next();
  }
}
