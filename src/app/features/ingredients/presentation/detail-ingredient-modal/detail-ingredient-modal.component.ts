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

@Component({
  selector: 'app-detail-ingredient-modal',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Ingredient</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding"> </ion-content>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailIngredientModalComponent {
  private modalCtrl = inject(ModalController);

  private id!: number;

  protected dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
