import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
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
} from '../../data-access';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';

@Component({
  selector: 'app-create-ingredient-modal',
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
        <ion-title>Create ingredient</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <app-ingredient-form [loading]="loading()" (save)="save($event)" />
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
export class CreateIngredientModalComponent {
  private modalCtrl = inject(ModalController);
  private detailStore = inject(DetailStoreService);

  protected loading = this.detailStore.loading;

  protected save(payload: CreateIngredientFormData): void {
    const effect: Effect = {
      type: EffectType.Create,
      payload,
    };
    this.detailStore.effect$.next(effect);
  }

  protected dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
