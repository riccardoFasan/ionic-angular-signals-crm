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
} from '@ionic/angular/standalone';
import { ListStoreService, STORE_HANDLER } from 'src/app/shared/data-access';
import { ScrollableListComponent } from 'src/app/shared/presentation';
import { Food } from '../../foods/data-access';
import { IngredientFoodsHandlerDirective } from '../utility';
import { Ingredient } from '../data-access';
import { ActivatedRoute } from '@angular/router';

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
        (scrollEnd)="listStore.loadPage$.next(nextPage())"
        (refresh)="listStore.refresh$.next()"
      >
        <ng-template #itemTemplate let-item>
          <ion-item>
            <ion-label>{{ item.name }}</ion-label>
          </ion-item>
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

  protected nextPage = computed<number>(
    () => this.listStore.searchCriteria().pagination.pageIndex + 1,
  );

  // @ts-ignore
  protected ingredient = computed<Ingredient | undefined>(
    () =>
      // @ts-ignore
      this.listStore.relatedItems()?.['ingredient'],
  );

  protected trackFn = (item: Omit<Food, 'ingredients'>): number | string =>
    this.storeHandler.extractPk(item);

  ngOnInit(): void {
    const ingredientId = this.route.snapshot.params['ingredientId'];
    if (!ingredientId) return;
    this.listStore.relatedItemsKeys$.next({ ingredientId });

    this.listStore.loadFirstPage$.next();
  }
}
