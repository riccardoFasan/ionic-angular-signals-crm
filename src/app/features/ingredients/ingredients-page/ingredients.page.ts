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
  IngredientModalsService,
  IngredientsHandlerDirective,
} from '../utility';
import {
  ListStoreService,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import { Ingredient } from '../data-access';
import {
  HasOperationPipe,
  ScrollableListComponent,
} from 'src/app/shared/presentation';

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
    HasOperationPipe,
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
        [loading]="listStore.currentOperations() | hasOperation: 'FETCH'"
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
  styles: [``],
  hostDirectives: [IngredientsHandlerDirective],
  providers: [ListStoreService],
})
export class IngredientsPage implements OnInit {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);
  protected ingredientModals = inject(IngredientModalsService);

  protected nextPage = computed<number>(
    () => this.listStore.searchCriteria().pagination.pageIndex + 1,
  );

  protected trackFn = (item: Ingredient): number | string =>
    this.storeHandler.extractPk(item);

  ngOnInit(): void {
    this.listStore.itemKeys$.next({});
    this.listStore.loadFirstPage$.next();
  }

  protected remove(item: Ingredient): void {
    this.listStore.itemOperation$.next({
      operation: { type: OperationType.Delete },
      item,
    });
  }

  protected async openModal(id?: number): Promise<void> {
    await this.ingredientModals.openModal(id);
    this.listStore.refresh$.next();
  }
}
