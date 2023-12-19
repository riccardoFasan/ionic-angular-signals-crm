import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-diary',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>Diary</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Diary</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <strong class="capitalize">Diary</strong>
        <p>
          Explore
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://ionicframework.com/docs/components"
            >UI Components</a
          >
        </p>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-menu-button {
        color: var(--ion-color-primary);
      }

      #container {
        text-align: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }

      #container strong {
        font-size: 20px;
        line-height: 26px;
      }

      #container p {
        font-size: 16px;
        line-height: 22px;
        color: #8c8c8c;
        margin: 0;
      }

      #container a {
        text-decoration: none;
      }
    `,
  ],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
  ],
})
export class DiaryPage {}
