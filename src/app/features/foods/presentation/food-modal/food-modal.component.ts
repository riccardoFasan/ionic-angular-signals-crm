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
import { CreateFoodFormData, UpdateFoodFormData } from '../../data-access';
import {
  DetailModalWrapperComponent,
  HasOperationPipe,
} from 'src/app/shared/presentation';
import { FoodFormComponent } from '../food-form/food-form.component';
import { FoodsHandlerDirective } from '../../utility';

@Component({
  selector: 'app-food-modal',
  standalone: true,
  imports: [
    IonButton,
    DetailModalWrapperComponent,
    FoodFormComponent,
    HasOperationPipe,
  ],
  template: `
    <app-detail-modal-wrapper
      [loading]="
        detailStore.currentOperations() | hasOperation: ['FETCH', 'CREATE']
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
      <app-food-form
        [loading]="
          detailStore.currentOperations()
            | hasOperation: ['FETCH', 'CREATE', 'UPDATE', 'DELETE']
        "
        (save)="save($event)"
        [food]="detailStore.item()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [FoodsHandlerDirective],
  providers: [DetailStoreService],
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

    this.detailStore.itemKeys$.next({ id: this.id });
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
    this.detailStore.operation$.next({ type: OperationType.Delete });
    this.modalCtrl.dismiss();
  }
}
