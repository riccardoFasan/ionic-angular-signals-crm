import { Component, effect, inject } from '@angular/core';
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
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { IngredientModalsService } from '../utility';
import { ListStoreService, STORE_HANDLER } from 'src/app/shared/data-access';
import { IngredientsHandlerService } from '../data-access';

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
    IonList,
    IonItem,
    IonLabel,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
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

      <ion-list>
        @for (ingredient of ingredients(); track ingredient.id) {
          <ion-item>
            <ion-label>{{ ingredient.name }}</ion-label>
          </ion-item>
        }
      </ion-list>
      <ion-infinite-scroll (ionInfinite)="onIonInfinite($event)">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>

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
  private ingredientModals = inject(IngredientModalsService);

  protected ingredients = this.listStore.items;
  protected total = this.listStore.total;
  protected searchCriteria = this.listStore.searchCriteria;
  protected loading = this.listStore.loading;
  protected canLoadNextPage = this.listStore.canLoadNextPage;

  private ionScrollEvent?: InfiniteScrollCustomEvent;

  constructor() {
    effect(() => {
      const loading = this.loading();
      if (loading) return;

      this.ionScrollEvent?.target.complete();
    });
  }

  ionViewWillEnter(): void {
    this.listStore.loadFirstPage$.next();
  }

  protected onIonInfinite(event: InfiniteScrollCustomEvent): void {
    if (!this.canLoadNextPage()) {
      event.target.complete();
      return;
    }
    this.listStore.loadNextPage$.next();
    this.ionScrollEvent = event;
  }

  protected createIngredient(): void {
    this.ingredientModals.openModal();
  }
}
