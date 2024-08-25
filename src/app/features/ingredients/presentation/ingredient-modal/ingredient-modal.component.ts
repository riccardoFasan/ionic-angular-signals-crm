import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  ModalController,
  NavController,
} from '@ionic/angular/standalone';
import { defer } from 'rxjs';
import { DetailStoreService, OperationType } from 'src/app/shared/data-access';
import {
  DetailModalWrapperComponent,
  HasOperationPipe,
} from 'src/app/shared/presentation';
import { AlertsService, ToastsService } from 'src/app/shared/utility';
import {
  CreateIngredientFormData,
  Ingredient,
  IngredientKeys,
  UpdateIngredientFormData,
} from '../../data-access';
import { IngredientsHandlerDirective } from '../../utility';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';
import { ingredientOperationMessage } from '../ingredient-operation-message';

@Component({
  selector: 'app-ingredient-modal',
  standalone: true,
  imports: [
    IonButton,
    DetailModalWrapperComponent,
    IngredientFormComponent,
    RouterLink,
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
      <app-ingredient-form
        [loading]="
          detailStore.currentOperations()
            | hasOperation: ['FETCH', 'CREATE', 'UPDATE', 'DELETE']
        "
        (save)="save($event)"
        [ingredient]="detailStore.item()"
      />

      <ion-button
        class="ion-margin-top"
        fill="clear"
        expand="block"
        (click)="toIngredientsFoodsPage()"
      >
        See all foods using this ingredient.
      </ion-button>
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [IngredientsHandlerDirective],
  providers: [DetailStoreService],
})
export class IngredientModalComponent implements OnInit {
  protected detailStore = inject(
    DetailStoreService<Ingredient, IngredientKeys>,
  );
  protected modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);
  private toasts = inject(ToastsService);
  private alerts = inject(AlertsService);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create ingredient';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.itemKeys$.next({ id: this.id });
  }

  protected toIngredientsFoodsPage(): void {
    this.modalCtrl.dismiss();
    this.navCtrl.navigateForward(`/ingredients/${this.id}/foods`);
  }

  protected save(
    payload: CreateIngredientFormData | UpdateIngredientFormData,
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
          const message = ingredientOperationMessage(operation.type, item!);
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
          const message = ingredientOperationMessage(operation.type, item!);
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
