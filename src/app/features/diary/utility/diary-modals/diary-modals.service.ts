import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ActivityModalComponent, MealModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class DiaryModalsService {
  private modalCtrl = inject(ModalController);

  async openActivityModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ActivityModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  async openMealModal(id?: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: MealModalComponent,
      componentProps: { id },
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
