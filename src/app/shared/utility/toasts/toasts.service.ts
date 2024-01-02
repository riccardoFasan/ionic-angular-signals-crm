import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { FALLBACK_ERROR_MESSAGE } from '../fallback-error-message';

@Injectable({
  providedIn: 'root',
})
export class ToastsService {
  private toastsCtrl = inject(ToastController);

  async error(message?: string): Promise<void> {
    const toast = await this.toastsCtrl.create({
      message: message || FALLBACK_ERROR_MESSAGE,
      color: 'danger',
      duration: 3000,
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }
}
