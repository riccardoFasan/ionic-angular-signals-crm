import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonMenuButton,
  IonText,
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
import {
  AlertsService,
  ModalsService,
  ToastsService,
} from 'src/app/shared/utility';
import { ActivityModalsService } from '../../activities/utility';
import { MealModalsService } from '../../meals/utility';
import { DiaryEvent, DiaryEventKeys } from '../data-access';
import {
  DiaryEventIconPipe,
  diaryOperationMessage,
  SkeletonDiaryItemComponent,
} from '../presentation';
import { DiaryHandlerDirective } from '../utility/diary-handler/diary-handler.directive';

@Component({
  selector: 'app-diary',
  standalone: true,
  imports: [
    DatePipe,
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
    IonLabel,
    IonText,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    ScrollableListComponent,
    DiaryEventIconPipe,
    HasOperationPipe,
    SkeletonListComponent,
    SkeletonDiaryItemComponent,
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
        [fetching]="listStore.currentOperations() | hasOperation: 'FETCH'"
        [operating]="
          listStore.currentOperations() | hasOperation: ['DELETE', 'REORDER']
        "
        [trackFn]="trackFn"
        (scrollEnd)="listStore.loadPage$.next(nextPage())"
        (refresh)="listStore.refresh$.next()"
      >
        <app-skeleton-list
          [size]="listStore.searchCriteria().pagination.pageSize"
          skeleton
        >
          <ng-template #skeletonTemplate>
            <app-skeleton-diary-item />
          </ng-template>
        </app-skeleton-list>

        <ng-template #itemTemplate let-item>
          <ion-item-sliding #itemSliding>
            <ion-item>
              <ion-icon
                aria-hidden="true"
                [md]="(item | diaryEventIcon) + '-sharp'"
                [ios]="(item | diaryEventIcon) + '-outline'"
                slot="start"
              />
              <div>
                <ion-label>{{ item.name }}</ion-label>
                <ion-text color="medium">
                  {{ item.at | date: 'dd/MM/YYYY HH:mm' }}
                  @if (item.end && item.end !== item.at) {
                    -
                    {{ item.end | date: 'dd/MM/YYYY HH:mm' }}
                  }
                </ion-text>
              </div>
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
              @if (item.type === 'MEAL') {
                <ion-item-option
                  (click)="[openMealModal(item.entityId), itemSliding.close()]"
                >
                  Edit meal
                </ion-item-option>
              } @else {
                <ion-item-option
                  (click)="
                    [openActivityModal(item.entityId), itemSliding.close()]
                  "
                >
                  Edit activity
                </ion-item-option>
              }

              <ion-item-option (click)="[reorder(item), itemSliding.close()]">
                Reorder
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
  styles: `
    ion-text {
      font-size: 0.8rem;
    }

    ion-item ion-icon[slot='start'] {
      margin-inline-end: 1.5rem;
    }
  `,
  hostDirectives: [DiaryHandlerDirective],
  providers: [ListStoreService],
})
export class DiaryPage implements OnInit {
  protected listStore = inject(
    ListStoreService<DiaryEvent, Partial<DiaryEventKeys>>,
  );
  protected storeHandler = inject(STORE_HANDLER);
  private mealModals = inject(MealModalsService);
  private activityModals = inject(ActivityModalsService);
  private modals = inject(ModalsService);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  protected nextPage = computed<number>(
    () => this.listStore.searchCriteria().pagination.pageIndex + 1,
  );

  protected trackFn = (item: DiaryEvent): number | string =>
    this.storeHandler.extractPk(item);

  ngOnInit(): void {
    this.listStore.itemKeys$.next({});
    this.listStore.loadFirstPage$.next();
  }

  protected remove(item: DiaryEvent): void {
    this.listStore.itemOperation$.next({
      operation: { type: OperationType.Delete },
      item,
      options: {
        onOperation: ({ operation, item }) => {
          const message = diaryOperationMessage(operation.type, item!);
          this.toasts.success(message);
        },
        canOperate: ({ item }) =>
          defer(() =>
            this.alerts.askConfirm(`Are you sure to delete ${item!.name}?`),
          ),
      },
    });
  }

  protected async openActivityModal(id?: number): Promise<void> {
    await this.activityModals.openModal(id);
    this.listStore.refresh$.next();
  }

  protected async openMealModal(id?: number): Promise<void> {
    await this.mealModals.openModal(id);
    this.listStore.refresh$.next();
  }

  protected async reorder(item: DiaryEvent): Promise<void> {
    const at = item.at.toISOString();
    const date = await this.modals.askDatetime(at);
    if (!date) return;
    this.listStore.itemOperation$.next({
      operation: { type: 'REORDER', payload: new Date(date) },
      item,
      options: {
        onOperation: ({ operation, item }) => {
          const message = diaryOperationMessage(operation.type, item!);
          this.toasts.success(message);
        },
      },
    });
  }
}
