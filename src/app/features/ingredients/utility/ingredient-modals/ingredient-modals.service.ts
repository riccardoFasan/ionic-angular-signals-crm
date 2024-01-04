import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IngredientModalComponent } from 'src/app/features/ingredients/presentation';

@Injectable({
  providedIn: 'root',
})
export class IngredientModalsService {
  private modalCtrl: ModalController = inject(ModalController);

  async openModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: IngredientModalComponent,
      componentProps: { id },
    });
    await modal.present();
  }
}
