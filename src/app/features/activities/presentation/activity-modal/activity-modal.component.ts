import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import {
  DetailStoreService,
  Operation,
  OperationType,
} from 'src/app/shared/data-access';
import {
  CreateActivityFormData,
  UpdateActivityFormData,
} from '../../data-access';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { ActivityFormComponent } from '../activity-form/activity-form.component';
import { ActivitiesHandlerDirective } from '../../utility';

@Component({
  selector: 'app-activity-modal',
  standalone: true,
  imports: [IonButton, DetailModalWrapperComponent, ActivityFormComponent],
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
      <app-activity-form
        [loading]="detailStore.mode() === 'PROCESSING'"
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
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create activity';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.pk$.next(this.id);
  }

  protected save(
    payload: CreateActivityFormData | UpdateActivityFormData,
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
