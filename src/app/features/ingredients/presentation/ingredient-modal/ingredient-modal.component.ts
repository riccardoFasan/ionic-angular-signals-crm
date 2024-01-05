import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ModalController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import {
  DetailStoreService,
  Effect,
  EffectType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import {
  CreateIngredientFormData,
  IngredientsHandlerService,
  UpdateIngredientFormData,
} from '../../data-access';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';

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
    IngredientFormComponent,
    IonSkeletonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          @if (mode() === 'FETCHING') {
            <ion-skeleton-text animated="true" />
          } @else {
            {{
              ingredient() ? 'Edit ' + ingredient().name : 'Create ingredient'
            }}
          }
        </ion-title>
        <ion-buttons slot="end">
          @if (ingredient()) {
            <ion-button (click)="remove()">Delete</ion-button>
          }
          <ion-button (click)="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (mode() === 'FETCHING') {
        <ion-skeleton-text animated="true" />
        <ion-skeleton-text animated="true" />
        <ion-skeleton-text animated="true" />
      } @else {
        <app-ingredient-form
          [loading]="mode() === 'PROCESSING'"
          (save)="save($event)"
          [ingredient]="ingredient()"
        />
      }
    </ion-content>
  `,
  styles: `
    ion-title ion-skeleton-text {
      width: 66%;
      height: 1.25rem;
    }

    ion-content ion-skeleton-text {
      height: 1.5rem;
      
      &:not(:last-child)  {
        margin-bottom: 0.75rem;
      }

      &:nth-child(1){
        width: 75%
      }
      
      &:nth-child(2){
        width: 66%
      }

      &:nth-child(3){
        width: 80%
      }

    }
  `,
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

  ionViewWillEnter(): void {
    if (!this.id) return;
    this.detailStore.id$.next(this.id);
  }

  protected save(
    payload: CreateIngredientFormData | UpdateIngredientFormData,
  ): void {
    const effect: Effect = {
      type: this.ingredient() ? EffectType.Update : EffectType.Create,
      payload,
    };
    this.detailStore.effect$.next(effect);
  }

  protected remove(): void {
    if (!this.ingredient()) return;
    const effect: Effect = {
      type: EffectType.Delete,
      payload: this.ingredient(),
    };
    this.detailStore.effect$.next(effect);
    this.dismiss();
  }

  protected dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
