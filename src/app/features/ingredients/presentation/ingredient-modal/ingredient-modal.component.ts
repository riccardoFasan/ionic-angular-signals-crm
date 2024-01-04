import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import {
  DetailStoreService,
  Effect,
  EffectType,
  STORE_HANDLER,
} from 'src/app/shared/data-access';
import {
  CreateIngredientFormData,
  IngredientsHandlerService,
  UpdateIngredientFormData,
} from '../../data-access';
import { IngredientModalsService } from '../../utility';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';

@Component({
  selector: 'app-ingredient-modal',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IngredientFormComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{ ingredient() ? ingredient().name : 'Create ingredient' }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <app-ingredient-form
        [loading]="loading()"
        (save)="save($event)"
        [ingredient]="ingredient()"
      />
    </ion-content>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DetailStoreService,
    {
      provide: STORE_HANDLER,
      useClass: IngredientsHandlerService,
    },
  ],
})
export class IngredientModalComponent implements OnInit {
  private detailStore = inject(DetailStoreService);
  private modalCtrl = inject(ModalController);

  private id!: number;

  protected loading = this.detailStore.loading;
  protected ingredient = this.detailStore.item;

  constructor() {
    effect(() => {
      const ingredient = this.ingredient();
      if (!ingredient) return;
      this.detailStore.id$.next(ingredient.id);
    });
  }

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.id$.next(this.id);
  }

  protected save(payload: CreateIngredientFormData): void {
    const effect: Effect = {
      type: this.ingredient() ? EffectType.Update : EffectType.Create,
      payload,
    };
    this.detailStore.effect$.next(effect);
  }

  protected dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
