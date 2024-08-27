import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { defer } from 'rxjs';
import { DetailStoreService, OperationType } from 'src/app/shared/data-access';
import {
  DetailModalWrapperComponent,
  HasOperationPipe,
} from 'src/app/shared/presentation';
import { AlertsService, ToastsService } from 'src/app/shared/presentation';
import {
  CreateActivityFormData,
  UpdateActivityFormData,
} from '../../data-access';
import { Activity, ActivityKeys } from '../../data-access/activity.model';
import { ActivitiesHandlerDirective } from '../../utility';
import { ActivityFormComponent } from '../activity-form/activity-form.component';
import { activityOperationMessage } from '../activity-operation-message';

@Component({
  selector: 'app-activity-modal',
  standalone: true,
  imports: [
    IonButton,
    DetailModalWrapperComponent,
    ActivityFormComponent,
    HasOperationPipe,
  ],
  template: `
    <app-detail-modal-wrapper
      [fetching]="detailStore.currentOperations() | hasOperation: 'FETCH'"
      [operating]="
        detailStore.currentOperations()
          | hasOperation: ['CREATE', 'UPDATE', 'DELETE']
      "
      [title]="title()"
      (refresh)="detailStore.refresh$.next()"
    >
      <ng-container ngProjectAs="[buttons]">
        @if (detailStore.item()) {
          <ion-button
            [disabled]="
              detailStore.currentOperations() | hasOperation: ['DELETE']
            "
            (click)="remove()"
          >
            Delete
          </ion-button>
        }
        <ion-button (click)="modalCtrl.dismiss()">Close</ion-button>
      </ng-container>
      <app-activity-form
        [loading]="
          detailStore.currentOperations()
            | hasOperation: ['FETCH', 'CREATE', 'UPDATE', 'DELETE']
        "
        [activity]="detailStore.item()"
        (save)="save($event)"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ActivitiesHandlerDirective],
  providers: [DetailStoreService],
})
export class ActivityModalComponent implements OnInit {
  protected detailStore = inject(DetailStoreService<Activity, ActivityKeys>);
  protected modalCtrl = inject(ModalController);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create activity';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.itemKeys$.next({ id: this.id });
  }

  protected save(
    payload: CreateActivityFormData | UpdateActivityFormData,
  ): void {
    this.detailStore.operation$.next({
      operation: {
        type: this.detailStore.item()
          ? OperationType.Update
          : OperationType.Create,
        payload,
      },
      options: {
        onOperation: ({ operation, item }) => {
          const message = activityOperationMessage(operation.type, item!);
          this.toasts.success(message);
        },
      },
    });
  }

  protected remove(): void {
    if (!this.detailStore.item()) return;
    this.detailStore.operation$.next({
      operation: { type: OperationType.Delete },
      options: {
        onOperation: ({ operation, item }) => {
          const message = activityOperationMessage(operation.type, item!);
          this.toasts.success(message);
          this.modalCtrl.dismiss();
        },
        canOperate: ({ item }) =>
          defer(() =>
            this.alerts.askConfirm(`Are you sure to delete ${item!.name}?`),
          ),
      },
    });
  }
}
