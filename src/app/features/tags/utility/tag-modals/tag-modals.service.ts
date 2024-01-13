import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { TagModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class TagModalsService {
  private modalCtrl = inject(ModalController);

  async openModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TagModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
