import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonFabButton,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonButton,
} from '@ionic/angular/standalone';
import { ListStoreService, STORE_HANDLER } from 'src/app/shared/data-access';
import {
  HasOperationPipe,
  ScrollableListComponent,
} from 'src/app/shared/presentation';
import { Food } from '../../foods/data-access';
import { IngredientFoodsHandlerDirective } from '../utility';
import { Ingredient } from '../data-access';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FoodModalsService } from '../../foods/utility';

@Component({
  selector: 'app-ingredient-foods',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonFabButton,
    IonItem,
    IonLabel,
    ScrollableListComponent,
    IonButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    RouterLink,
    HasOperationPipe,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>
          @if (ingredient()) {
            {{ ingredient()!.name }}'s Foods
          } @else {
            Foods
          }
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" [routerLink]="['/foods']">
            All foods
          </ion-button>
        </ion-buttons>
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

            <ion-item-options side="end">
              <ion-item-option
                (click)="[openModal(item.id), itemSliding.close()]"
              >
                View
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ng-template>
      </app-scrollable-list>
    </ion-content>
  `,
  styles: ``,
  hostDirectives: [IngredientFoodsHandlerDirective],
  providers: [ListStoreService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientFoodsPage implements OnInit {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);
  private route = inject(ActivatedRoute);
  private foodModals = inject(FoodModalsService);

  protected nextPage = computed<number>(
    () => this.listStore.searchCriteria().pagination.pageIndex + 1,
  );

  protected ingredient = computed<Ingredient | undefined>(
    () =>
      // @ts-ignore
      this.listStore.relatedItems()?.['ingredient'],
  );

  protected trackFn = (item: Omit<Food, 'ingredients'>): number | string =>
    this.storeHandler.extractPk(item);

  ngOnInit(): void {
    const ingredientIdParam = this.route.snapshot.params['ingredientId'];
    const ingredientId = ingredientIdParam
      ? parseInt(ingredientIdParam)
      : undefined;
    if (!ingredientId) return;
    this.listStore.itemKeys$.next({ ingredientId });
    this.listStore.loadFirstPage$.next();
    this.listStore.loadRelatedItems$.next();
  }

  protected async openModal(id?: number): Promise<void> {
    await this.foodModals.openModal(id);
    this.listStore.refresh$.next();
  }
}
