import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import {
  DetailStoreService,
  Operation,
  OperationType,
} from 'src/app/shared/data-access';
import {
  CreateActivityTypeFormData,
  UpdateActivityTypeFormData,
} from '../../data-access';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { ActivityTypeFormComponent } from '../activity-type-form/activity-type-form.component';
import { ActivityTypesHandlerDirective } from '../../utility';

@Component({
  selector: 'app-activity-type-modal',
  standalone: true,
  imports: [IonButton, DetailModalWrapperComponent, ActivityTypeFormComponent],
  template: `
    <app-detail-modal-wrapper
      [loading]="
        detailStore.mode() === 'PROCESSING' || detailStore.mode() === 'FETCHING'
      "
      [title]="title()"
      (refresh)="detailStore.refresh$.next()"
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
  hostDirectives: [ActivityTypesHandlerDirective],
  providers: [DetailStoreService],
})
export class ActivityTypeModalComponent implements OnInit {
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

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
    this.detailStore.operation$.next({ type: OperationType.Delete });
    this.modalCtrl.dismiss();
  }
}
