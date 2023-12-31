import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonFabButton,
  IonFab,
  IonIcon,
} from '@ionic/angular/standalone';
import { IngredientModalsService } from '../utility';

@Component({
  selector: 'app-ingredients',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>Ingredients</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ingredients</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="createIngredient()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [``],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonFabButton,
    IonFab,
    IonIcon,
  ],
})
export class IngredientsPage {
  private ingredientModals = inject(IngredientModalsService);

  protected createIngredient(): void {
    this.ingredientModals.openCreateModal();
  }
}
