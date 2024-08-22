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
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { MealFormComponent } from '../meal-form/meal-form.component';
import { CreateMealFormData, UpdateMealFormData } from '../../data-access';
import { MealsHandlerDirective } from '../../utility';

@Component({
  selector: 'app-meal-modal',
  standalone: true,
  imports: [IonButton, DetailModalWrapperComponent, MealFormComponent],
  template: `
    <app-detail-modal-wrapper
      [loading]="
        detailStore.mode() === 'OPERATING' || detailStore.mode() === 'FETCHING'
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
      <app-meal-form
        [loading]="
          detailStore.mode() === 'OPERATING' ||
          detailStore.mode() === 'FETCHING'
        "
        (save)="save($event)"
        [meal]="detailStore.item()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [MealsHandlerDirective],
  providers: [DetailStoreService],
})
export class MealModalComponent implements OnInit {
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create meal';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.itemKeys$.next({ id: this.id });
  }

  protected save(payload: CreateMealFormData | UpdateMealFormData): void {
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
