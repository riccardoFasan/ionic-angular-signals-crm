import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{ ingredient() ? 'Edit ' + ingredient().name : 'Create ingredient' }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Close</ion-button>
          <ion-button (click)="remove()">Delete</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <app-ingredient-form
        [loading]="loading()"
        (save)="save($event)"
        [ingredient]="ingredient()"
      />
    </ion-content>
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

  protected loading = this.detailStore.loading;
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
