import { Component, OnInit, computed, inject } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { defer } from 'rxjs';
import {
  ListStoreService,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import {
  HasOperationPipe,
  ScrollableListComponent,
  SkeletonListComponent,
} from 'src/app/shared/presentation';
import { AlertsService, ToastsService } from 'src/app/shared/presentation';
import { Ingredient, IngredientKeys } from '../data-access';
import { ingredientOperationMessage } from '../presentation';
import {
  IngredientModalsService,
  IngredientsHandlerDirective,
} from '../utility';

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
    SkeletonListComponent,
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
        [fetching]="listStore.currentOperations() | hasOperation: 'FETCH'"
        [operating]="listStore.currentOperations() | hasOperation: 'DELETE'"
        [trackFn]="trackFn"
        (scrollEnd)="listStore.loadPage$.next(nextPage())"
        (refresh)="listStore.refresh$.next()"
      >
        <app-skeleton-list
          [size]="listStore.searchCriteria().pagination.pageSize"
          skeleton
        />

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
  protected listStore = inject(
    ListStoreService<Ingredient, Partial<IngredientKeys>>,
  );
  protected storeHandler = inject(STORE_HANDLER);
  protected ingredientModals = inject(IngredientModalsService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

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
      options: {
        onOperation: ({ operation, item }) => {
          const message = ingredientOperationMessage(operation.type, item!);
          this.toasts.success(message);
        },
        canOperate: ({ item }) =>
          defer(() =>
            this.alerts.askConfirm(`Are you sure to delete ${item!.name}?`),
          ),
      },
    });
  }

  protected async openModal(id?: number): Promise<void> {
    await this.ingredientModals.openModal(id);
    this.listStore.refresh$.next();
  }
}
