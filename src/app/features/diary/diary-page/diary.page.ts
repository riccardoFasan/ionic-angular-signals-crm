import { Component, OnInit, inject } from '@angular/core';
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
  IonFabList,
} from '@ionic/angular/standalone';
import {
  ListStoreService,
  Operation,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import { ScrollableListComponent } from 'src/app/shared/presentation';
import { IngredientsHandlerService } from '../../ingredients/data-access';
import { MealModalsService } from '../../meals/utility';
import { ActivityModalsService } from '../../activities/utility';
import { Meal } from '../../meals/data-access';
import { Activity } from '../../activities/data-access';

@Component({
  selector: 'app-diary',
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
    IonFabList,
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
        <ion-title>Diary</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Diary</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-scrollable-list
        [items]="listStore.items()"
        [canLoadNextPage]="listStore.canLoadNextPage()"
        [loading]="listStore.mode() === 'FETCHING'"
        [trackFn]="trackFn"
        (scrollEnd)="loadNextPage()"
      >
        <ng-template #itemTemplate let-item>
          <ion-item-sliding #itemSliding>
            <ion-item>
              <ion-label>{{ item.name }}</ion-label>
            </ion-item>

            <ion-item-options>
              <!-- <ion-item-option
                (click)="[openModal(item.id), itemSliding.close()]"
              >
                Edit
              </ion-item-option> -->
              <ion-item-option
                (click)="[remove(item), itemSliding.close()]"
                color="danger"
              >
                Delete
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ng-template>
      </app-scrollable-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button>
          <ion-icon name="add" />
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button (click)="openActivityModal()">
            <ion-icon ios="calendar-clear-outline" md="calendar-clear-sharp" />
          </ion-fab-button>
          <ion-fab-button (click)="openMealModal()">
            <ion-icon ios="pizza-outline" md="pizza-sharp" />
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  `,
  styles: [``],
  providers: [
    ListStoreService,
    {
      provide: STORE_HANDLER,
      useClass: IngredientsHandlerService,
    },
  ],
})
export class DiaryPage implements OnInit {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);
  protected mealModals = inject(MealModalsService);
  protected activityModals = inject(ActivityModalsService);

  protected trackFn = (item: Meal | Activity): number =>
    this.storeHandler.extractId(item);

  ngOnInit(): void {
    this.listStore.loadFirstPage$.next();
  }

  protected loadNextPage(): void {
    if (!this.listStore.canLoadNextPage()) return;
    this.listStore.loadNextPage$.next();
  }

  protected remove(item: Meal | Activity): void {
    const operation: Operation = {
      type: OperationType.Delete,
      payload: item,
    };
    this.listStore.operation$.next({ operation, item });
  }

  protected async openActivityModal(id?: number): Promise<void> {
    await this.activityModals.openModal(id);
    this.listStore.refresh$.next();
  }

  protected async openMealModal(id?: number): Promise<void> {
    await this.mealModals.openModal(id);
    this.listStore.refresh$.next();
  }
}
