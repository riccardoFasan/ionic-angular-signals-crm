import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ActivityModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class ActivityModalsService {
  private modalCtrl = inject(ModalController);

  async openModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ActivityModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
