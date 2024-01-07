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
  OperationType,
  Operation,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import {
  CreateIngredientFormData,
  IngredientsHandlerService,
  UpdateIngredientFormData,
} from '../../data-access';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';

@Component({
  selector: 'app-ingredient-modal',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    DetailModalWrapperComponent,
    IngredientFormComponent,
  ],
  template: `
    <app-detail-modal-wrapper
      [loading]="mode() === 'PROCESSING'"
      [title]="title()"
    >
      <span buttons>
        @if (ingredient()) {
          <ion-button (click)="remove()">Delete</ion-button>
        }
        <ion-button (click)="dismiss()">Close</ion-button>
      </span>
      <app-ingredient-form
        [loading]="mode() === 'PROCESSING'"
        (save)="save($event)"
        [ingredient]="ingredient()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DetailStoreService,
    {
      provide: STORE_HANDLER,
      useClass: IngredientsHandlerService,
    },
  ],
})
export class IngredientModalComponent implements ViewWillEnter {
  private detailStore = inject(DetailStoreService);
  private modalCtrl = inject(ModalController);

  private id!: number;

  protected mode = this.detailStore.mode;
  protected ingredient = this.detailStore.item;

  protected title = computed<string>(() => {
    const ingredientName = this.ingredient()?.name;
    return ingredientName ? `Edit ${ingredientName}` : 'Create ingredient';
  });

  ionViewWillEnter(): void {
    if (!this.id) return;
    this.detailStore.id$.next(this.id);
  }

  protected save(
    payload: CreateIngredientFormData | UpdateIngredientFormData,
  ): void {
    const operation: Operation = {
      type: this.ingredient() ? OperationType.Update : OperationType.Create,
      payload,
    };
    this.detailStore.operation$.next(operation);
  }

  protected remove(): void {
    if (!this.ingredient()) return;
    const operation: Operation = {
      type: OperationType.Delete,
      payload: this.ingredient(),
    };
    this.detailStore.operation$.next(operation);
    this.dismiss();
  }

  protected dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
