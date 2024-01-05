import { Component, inject } from '@angular/core';
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
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { IngredientModalsService } from '../utility';
import { ListStoreService, STORE_HANDLER } from 'src/app/shared/data-access';
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
    IonLabel,
    ScrollableListComponent,
  ],
  providers: [
    ListStoreService,
    {
      provide: STORE_HANDLER,
      useClass: IngredientsHandlerService,
    },
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
        [items]="ingredients()"
        [canLoadNextPage]="canLoadNextPage()"
        [loading]="loading()"
        [trackFn]="trackFn"
        (scrollEnd)="loadNextPage()"
      >
        <ng-template #itemTemplate let-item>
          <ion-item>
            <ion-label>{{ item.name }}</ion-label>
          </ion-item>
        </ng-template>
      </app-scrollable-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="createIngredient()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [``],
})
export class IngredientsPage implements ViewWillEnter {
  private listStore = inject(ListStoreService);
  private storeHandler = inject(STORE_HANDLER);
  private ingredientModals = inject(IngredientModalsService);

  protected ingredients = this.listStore.items;
  protected loading = this.listStore.loading;
  protected canLoadNextPage = this.listStore.canLoadNextPage;

  protected trackFn = (ingredient: Ingredient): number =>
    this.storeHandler.extractId(ingredient);

  ionViewWillEnter(): void {
    this.listStore.loadFirstPage$.next();
  }

  protected loadNextPage(): void {
    if (!this.canLoadNextPage()) return;
    this.listStore.loadNextPage$.next();
  }

  protected createIngredient(): void {
    this.ingredientModals.openModal();
  }
}
