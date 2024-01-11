import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FoodModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class FoodModalsService {
  private modalCtrl: ModalController = inject(ModalController);

  async openModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: FoodModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
