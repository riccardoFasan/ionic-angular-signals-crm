import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import {
  FALLBACK_ERROR_MESSAGE,
  FALLBACK_SUCCESS_MESSAGE,
} from '../../utility/fallback-messages';

@Injectable({
  providedIn: 'root',
})
export class ToastsService {
  private toastsCtrl = inject(ToastController);

  async error(message?: string): Promise<void> {
    const toast = await this.toastsCtrl.create({
      message: message || FALLBACK_ERROR_MESSAGE,
      color: 'danger',
      duration: 2000,
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }

  async success(message?: string): Promise<void> {
    const toast = await this.toastsCtrl.create({
      message: message || FALLBACK_SUCCESS_MESSAGE,
      color: 'success',
      duration: 2000,
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }
}
