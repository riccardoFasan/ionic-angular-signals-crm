import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { DatetimeModalComponent } from '../../presentation';

@Injectable({
  providedIn: 'root',
})
export class ModalsService {
  private modalCtrl = inject(ModalController);

  async askDatetime(value?: string): Promise<string | null> {
    const modal = await this.modalCtrl.create({
      component: DatetimeModalComponent,
      componentProps: { value },
      cssClass: 'modal-alert',
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    return result.data || null;
  }
}
