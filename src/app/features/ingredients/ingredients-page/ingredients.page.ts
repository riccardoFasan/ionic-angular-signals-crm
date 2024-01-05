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
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
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
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
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
        [loading]="mode() === 'FETCHING'"
        [trackFn]="trackFn"
        (scrollEnd)="loadNextPage()"
      >
        <ng-template #itemTemplate let-item>
          <ion-item-sliding>
            <ion-item>
              <ion-label>{{ item.name }}</ion-label>
            </ion-item>

            <ion-item-options>
              <ion-item-option (click)="openModal(item.id)">
                Edit
              </ion-item-option>
              <!-- <ion-item-option (click)="remove(item.id)" color="danger">
                Delete
              </ion-item-option> -->
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
})
export class IngredientsPage implements ViewWillEnter {
  private listStore = inject(ListStoreService);
  private storeHandler = inject(STORE_HANDLER);
  private ingredientModals = inject(IngredientModalsService);

  protected ingredients = this.listStore.items;
  protected mode = this.listStore.mode;
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

  // protected remove(ingredient:Ingredient): void {
  //   const effect: Effect = {
  //     type: EffectType.Delete,
  //     payload: ingredient,
  //   };
  //   this.listStore.effect$.next(effect);
  // }

  protected openModal(id?: number): void {
    this.ingredientModals.openModal(id);
  }
}
