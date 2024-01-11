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
  ViewWillEnter,
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
      [loading]="detailStore.mode() === 'PROCESSING'"
      [title]="title()"
    >
      <ng-container ngProjectAs="[buttons]">
        @if (detailStore.item()) {
          <ion-button (click)="remove()">Delete</ion-button>
        }
        <ion-button (click)="modalCtrl.dismiss()">Close</ion-button>
      </ng-container>
      <app-activity-type-form
        [loading]="detailStore.mode() === 'PROCESSING'"
        (save)="save($event)"
        [activityType]="detailStore.item()"
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
export class ActivityTypeModalComponent implements ViewWillEnter {
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create activity';
  });

  ionViewWillEnter(): void {
    if (!this.id) return;
    this.detailStore.id$.next(this.id);
  }

  protected save(
    payload: CreateActivityTypeFormData | UpdateActivityTypeFormData,
  ): void {
    const operation: Operation = {
      type: this.detailStore.item()
        ? OperationType.Update
        : OperationType.Create,
      payload,
    };
    this.detailStore.operation$.next(operation);
  }

  protected remove(): void {
    if (!this.detailStore.item()) return;
    const operation: Operation = {
      type: OperationType.Delete,
      payload: this.detailStore.item(),
    };
    this.detailStore.operation$.next(operation);
    this.modalCtrl.dismiss();
  }
}
