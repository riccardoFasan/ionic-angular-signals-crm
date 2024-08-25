import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/angular/standalone';
import { InitializerService } from './shared/utility';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-split-pane contentId="main-content">
        <ion-menu contentId="main-content" type="overlay">
          <ion-content>
            <ion-list>
              <ion-list-header>Food diary</ion-list-header>

              <ion-menu-toggle auto-hide="false">
                <ion-item
                  routerDirection="root"
                  routerLink="diary"
                  lines="none"
                  detail="false"
                  routerLinkActive="selected"
                >
                  <ion-icon
                    aria-hidden="true"
                    slot="start"
                    ios="book-outline"
                    md="book-sharp"
                  />
                  <ion-label>Diary</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item
                  routerDirection="root"
                  routerLink="activity-types"
                  lines="none"
                  detail="false"
                  routerLinkActive="selected"
                >
                  <ion-icon
                    aria-hidden="true"
                    slot="start"
                    ios="calendar-outline"
                    md="calendar-sharp"
                  />
                  <ion-label>Activities</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item
                  routerDirection="root"
                  routerLink="tags"
                  lines="none"
                  detail="false"
                  routerLinkActive="selected"
                >
                  <ion-icon
                    aria-hidden="true"
                    slot="start"
                    ios="pricetag-outline"
                    md="pricetag-sharp"
                  />
                  <ion-label>Tags</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item
                  routerDirection="root"
                  routerLink="foods"
                  lines="none"
                  detail="false"
                  routerLinkActive="selected"
                >
                  <ion-icon
                    aria-hidden="true"
                    slot="start"
                    ios="fast-food-outline"
                    md="fast-food-sharp"
                  />
                  <ion-label>Foods</ion-label>
                </ion-item>
              </ion-menu-toggle>

              <ion-menu-toggle auto-hide="false">
                <ion-item
                  routerDirection="root"
                  routerLink="ingredients"
                  lines="none"
                  detail="false"
                  routerLinkActive="selected"
                >
                  <ion-icon
                    aria-hidden="true"
                    slot="start"
                    ios="list-outline"
                    md="list-sharp"
                  />
                  <ion-label>Ingredients</ion-label>
                </ion-item>
              </ion-menu-toggle>
            </ion-list>
          </ion-content>
        </ion-menu>
        <ion-router-outlet id="main-content" />
      </ion-split-pane>
    </ion-app>
  `,
  styles: [
    `
      ion-menu ion-content {
        --background: var(
          --ion-item-background,
          var(--ion-background-color, #fff)
        );

        ion-list ion-list-header {
          margin-bottom: 30px;
        }

        &.md {
          --padding-start: 8px;
          --padding-end: 8px;
          --padding-top: 20px;
          --padding-bottom: 20px;

          ion-list {
            padding: 20px 0;

            ion-list-header {
              font-size: 22px;
              font-weight: 600;
              min-height: 20px;
              padding-left: 10px;
            }

            ion-item {
              --padding-start: 10px;
              --padding-end: 10px;
              border-radius: 4px;

              ion-label {
                font-weight: 500;
              }

              ion-icon {
                color: #616e7e;
              }

              &.selected {
                --background: rgba(var(--ion-color-primary-rgb), 0.14);

                ion-icon {
                  color: var(--ion-color-primary);
                }
              }
            }
          }
        }

        &.ios {
          --padding-bottom: 20px;

          ion-list {
            padding: 20px 0 0 0;

            ion-list-header {
              padding-left: 16px;
              padding-right: 16px;
            }

            ion-item {
              --padding-start: 16px;
              --padding-end: 16px;
              --min-height: 50px;

              ion-icon {
                font-size: 24px;
                color: #73849a;
              }

              &.selected {
                --color: var(--ion-color-primary);

                ion-icon {
                  color: var(--ion-color-primary);
                }
              }
            }
          }
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  protected initializer = inject(InitializerService);

  constructor() {
    this.initializer.initialize$.next();
  }
}
