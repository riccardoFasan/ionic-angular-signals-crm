import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import {
  CreateIngredientModalComponent,
  DetailIngredientModalComponent,
} from 'src/app/features/ingredients/presentation';

@Injectable({
  providedIn: 'root',
})
export class IngredientModalsService {
  private modalCtrl: ModalController = inject(ModalController);

  async openCreateModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CreateIngredientModalComponent,
    });
    await modal.present();
  }

  async openDetailModal(id: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DetailIngredientModalComponent,
      componentProps: { id },
    });
    await modal.present();
  }
}
