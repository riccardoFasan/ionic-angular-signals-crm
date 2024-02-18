import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-datetime-modal',
  standalone: true,
  imports: [IonDatetime],
  template: `
    <div class="ion-padding">
      <ion-datetime
        [value]="value"
        (cancel)="modalCtrl.dismiss()"
        (confirm)="modalCtrl.dismiss()"
        (ionChange)="modalCtrl.dismiss($any($event.detail.value))"
        showDefaultButtons="true"
      />
    </div>
  `,
  styles: `
    // ion-modal {
    //       &::part(content) {
    //         background: transparent;
    //       }

    //       &::part(backdrop) {
    //         --backdrop-opacity: 0.75;
    //       }
    //     }

    div:has(ion-datetime) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      width: 100%;
      background: transparent;

      ion-datetime {
        max-width: unset;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatetimeModalComponent {
  protected modalCtrl = inject(ModalController);

  protected value?: Date;
}
