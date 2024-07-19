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
  IonFabList,
  IonText,
} from '@ionic/angular/standalone';
import {
  ListStoreService,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import { ScrollableListComponent } from 'src/app/shared/presentation';
import { MealModalsService } from '../../meals/utility';
import { ActivityModalsService } from '../../activities/utility';
import { DiaryEvent, DiaryEventType } from '../data-access';
import { DiaryEventIconPipe } from '../presentation';
import { DatePipe } from '@angular/common';
import { DiaryHandlerDirective } from '../utility/diary-handler/diary-handler.directive';
import { ModalsService } from 'src/app/shared/utility';

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
        (scrollEnd)="listStore.loadPage$.next(nextPage())"
        (refresh)="listStore.refresh$.next()"
      >
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
              <ion-item-option (click)="[openModal(item), itemSliding.close()]">
                Edit
              </ion-item-option>
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
  `,
  hostDirectives: [DiaryHandlerDirective],
  providers: [ListStoreService],
})
export class DiaryPage implements OnInit {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);
  protected mealModals = inject(MealModalsService);
  protected activityModals = inject(ActivityModalsService);
  protected modals = inject(ModalsService);

  protected nextPage = computed<number>(
    () => this.listStore.searchCriteria().pagination.pageIndex + 1,
  );

  protected trackFn = (item: DiaryEvent): number | string =>
    this.storeHandler.extractId(item);

  ngOnInit(): void {
    this.listStore.loadFirstPage$.next();
  }

  protected remove(item: DiaryEvent): void {
    this.listStore.itemOperation$.next({
      operation: { type: OperationType.Delete },
      item,
    });
  }

  protected async openModal({ entityId, type }: DiaryEvent): Promise<void> {
    if (type === DiaryEventType.Meal) {
      await this.openMealModal(entityId);
      return;
    }
    await this.openActivityModal(entityId);
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
    });
  }
}
