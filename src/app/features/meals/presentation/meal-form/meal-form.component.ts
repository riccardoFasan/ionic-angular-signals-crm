import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  effect,
  input,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonTextarea,
} from '@ionic/angular/standalone';
import { DatetimeInputComponent } from 'src/app/shared/presentation';
import { Consumption, Meal } from '../../data-access';
import { ConsumptionInputComponent } from '../consumption-input/consumption-input.component';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    ReactiveFormsModule,
    DatetimeInputComponent,
    ConsumptionInputComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ion-list class="ion-margin-bottom">
        <ion-item>
          <ion-input
            label="Meal name *"
            labelPlacement="stacked"
            placeholder="Write the name of the meal"
            formControlName="name"
            required="true"
          />
        </ion-item>
        <ion-item>
          <app-datetime-input
            label="At"
            labelPlacement="stacked"
            placeholder="Choose the date of the meal"
            formControlName="at"
          />
        </ion-item>
        <ion-item>
          <ion-textarea
            label="Notes"
            labelPlacement="stacked"
            placeholder="Write something"
            formControlName="notes"
          />
        </ion-item>
      </ion-list>

      <app-consumption-input formControlName="consumptions" />

      <ion-button
        type="submit"
        expand="block"
        [disabled]="loading() || (form.invalid && form.touched)"
      >
        {{ meal() ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealFormComponent {
  loading = input<boolean>(false);
  meal = input<Meal>();

  constructor() {
    effect(
      () => {
        const meal = this.meal();
        if (!meal) return;
        this.form.patchValue({
          name: meal.name,
          at: meal.at,
          notes: meal.notes,
          consumptions: meal.consumptions,
        });
      },
      { allowSignalWrites: true },
    );
  }

  @Output() save = new EventEmitter();

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    at: new FormControl<Date>(new Date(), Validators.required),
    notes: new FormControl<string>(''),
    consumptions: new FormControl<Consumption[]>([], Validators.minLength(1)),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    const formData = {
      name: this.form.value.name || '',
      at: this.form.value.at || new Date(),
      notes: this.form.value.notes || '',
      consumptions: this.form.value.consumptions || [],
    };
    this.save.emit(formData);
  }
}
