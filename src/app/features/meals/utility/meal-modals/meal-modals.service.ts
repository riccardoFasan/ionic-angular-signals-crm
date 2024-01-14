import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { MealModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class MealModalsService {
  private modalCtrl = inject(ModalController);

  async openModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: MealModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
