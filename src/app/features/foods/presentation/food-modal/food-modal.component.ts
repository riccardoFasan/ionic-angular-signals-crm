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
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import {
  FoodsHandlerService,
  CreateFoodFormData,
  UpdateFoodFormData,
} from '../../data-access';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { FoodFormComponent } from '../food-form/food-form.component';

@Component({
  selector: 'app-food-modal',
  standalone: true,
  imports: [IonButton, DetailModalWrapperComponent, FoodFormComponent],
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
      <app-food-form
        [loading]="detailStore.mode() === 'PROCESSING'"
        (save)="save($event)"
        [food]="detailStore.item()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DetailStoreService,
    {
      provide: STORE_HANDLER,
      useClass: FoodsHandlerService,
    },
  ],
})
export class FoodModalComponent implements OnInit {
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create food';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.id$.next(this.id);
  }

  protected save(payload: CreateFoodFormData | UpdateFoodFormData): void {
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
