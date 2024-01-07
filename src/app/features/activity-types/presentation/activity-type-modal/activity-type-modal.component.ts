import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import {
  DetailStoreService,
  Operation,
  OperationType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import {
  ActivityTypesHandlerService,
  CreateActivityTypeFormData,
  UpdateActivityTypeFormData,
} from '../../data-access';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { ActivityTypeFormComponent } from '../activity-type-form/activity-type-form.component';

@Component({
  selector: 'app-activity-type-modal',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    DetailModalWrapperComponent,
    ActivityTypeFormComponent,
  ],
  template: `
    <app-detail-modal-wrapper
      [loading]="mode() === 'PROCESSING'"
      [title]="title()"
    >
      <ng-template buttons>
        @if (activityType()) {
          <ion-button (click)="remove()">Delete</ion-button>
        }
        <ion-button (click)="dismiss()">Close</ion-button>
      </ng-template>
      <app-activity-type-form
        [loading]="mode() === 'PROCESSING'"
        (save)="save($event)"
        [activityType]="activityType()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DetailStoreService,
    {
      provide: STORE_HANDLER,
      useClass: ActivityTypesHandlerService,
    },
  ],
})
export class ActivityTypeModalComponent {
  private detailStore = inject(DetailStoreService);
  private modalCtrl = inject(ModalController);

  private id!: number;

  protected mode = this.detailStore.mode;
  protected activityType = this.detailStore.item;

  protected title = computed<string>(() => {
    const activityTypeName = this.activityType()?.name;
    return activityTypeName ? `Edit ${activityTypeName}` : 'Create activity';
  });

  ionViewWillEnter(): void {
    if (!this.id) return;
    this.detailStore.id$.next(this.id);
  }

  protected save(
    payload: CreateActivityTypeFormData | UpdateActivityTypeFormData,
  ): void {
    const operation: Operation = {
      type: this.activityType() ? OperationType.Update : OperationType.Create,
      payload,
    };
    this.detailStore.operation$.next(operation);
  }

  protected remove(): void {
    if (!this.activityType()) return;
    const operation: Operation = {
      type: OperationType.Delete,
      payload: this.activityType(),
    };
    this.detailStore.operation$.next(operation);
    this.dismiss();
  }

  protected dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
