import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ActivityTypeModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypesModalsService {
  private modalCtrl: ModalController = inject(ModalController);

  async openModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ActivityTypeModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
