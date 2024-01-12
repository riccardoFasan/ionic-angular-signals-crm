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
} from '@ionic/angular/standalone';
import { IngredientModalsService } from '../utility';
import {
  ListStoreService,
  Operation,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import { Ingredient, IngredientsHandlerService } from '../data-access';
import { ScrollableListComponent } from 'src/app/shared/presentation';

@Component({
  selector: 'app-ingredients',
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
        <ion-title>Ingredients</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ingredients</ion-title>
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
              <ion-item-option
                (click)="[openModal(item.id), itemSliding.close()]"
              >
                Edit
              </ion-item-option>
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
        <ion-fab-button (click)="openModal()">
          <ion-icon name="add" />
        </ion-fab-button>
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
export class IngredientsPage implements OnInit {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);
  protected ingredientModals = inject(IngredientModalsService);

  protected trackFn = (ingredient: Ingredient): number =>
    this.storeHandler.extractId(ingredient);

  ngOnInit(): void {
    this.listStore.loadFirstPage$.next();
  }

  protected loadNextPage(): void {
    if (!this.listStore.canLoadNextPage()) return;
    this.listStore.loadNextPage$.next();
  }

  protected remove(ingredient: Ingredient): void {
    const operation: Operation = {
      type: OperationType.Delete,
      payload: ingredient,
    };
    this.listStore.operation$.next({ operation, item: ingredient });
  }

  protected async openModal(id?: number): Promise<void> {
    await this.ingredientModals.openModal(id);
    this.listStore.refresh$.next();
  }
}
