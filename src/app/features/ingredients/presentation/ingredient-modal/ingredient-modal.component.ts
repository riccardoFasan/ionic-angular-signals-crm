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
  OperationType,
  Operation,
} from 'src/app/shared/data-access';
import {
  CreateIngredientFormData,
  UpdateIngredientFormData,
} from '../../data-access';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { IngredientsHandlerDirective } from '../../utility';

@Component({
  selector: 'app-ingredient-modal',
  standalone: true,
  imports: [IonButton, DetailModalWrapperComponent, IngredientFormComponent],
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
      <app-ingredient-form
        [loading]="detailStore.mode() === 'PROCESSING'"
        (save)="save($event)"
        [ingredient]="detailStore.item()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [IngredientsHandlerDirective],
  providers: [DetailStoreService],
})
export class IngredientModalComponent implements OnInit {
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create ingredient';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.pk$.next(this.id);
  }

  protected save(
    payload: CreateIngredientFormData | UpdateIngredientFormData,
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
