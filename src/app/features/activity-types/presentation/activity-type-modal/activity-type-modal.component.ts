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
import { AlertsService, ToastsService } from 'src/app/shared/utility';
import {
  CreateActivityTypeFormData,
  UpdateActivityTypeFormData,
} from '../../data-access';
import {
  ActivityType,
  ActivityTypeKeys,
} from '../../data-access/activity-type.model';
import { ActivityTypesHandlerDirective } from '../../utility';
import { ActivityTypeFormComponent } from '../activity-type-form/activity-type-form.component';
import { activityTypeOperationMessage } from '../activity-type-operation-message';

@Component({
  selector: 'app-activity-type-modal',
  standalone: true,
  imports: [
    IonButton,
    DetailModalWrapperComponent,
    ActivityTypeFormComponent,
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
      <app-activity-type-form
        [loading]="
          detailStore.currentOperations()
            | hasOperation: ['FETCH', 'CREATE', 'UPDATE', 'DELETE']
        "
        (save)="save($event)"
        [activityType]="detailStore.item()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ActivityTypesHandlerDirective],
  providers: [DetailStoreService],
})
export class ActivityTypeModalComponent implements OnInit {
  protected detailStore = inject(
    DetailStoreService<ActivityType, ActivityTypeKeys>,
  );
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
    payload: CreateActivityTypeFormData | UpdateActivityTypeFormData,
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
          const message = activityTypeOperationMessage(operation.type, item!);
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
          const message = activityTypeOperationMessage(operation.type, item!);
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
