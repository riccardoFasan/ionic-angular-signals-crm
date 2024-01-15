import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormArray,
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
import {
  DatetimeInputComponent,
  SearchableSelectComponent,
} from 'src/app/shared/presentation';
import { Consumption, Meal } from '../../data-access';
import { FoodsSelectDirective } from 'src/app/features/foods/utility';
import { Food } from 'src/app/features/foods/data-access';

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
    SearchableSelectComponent,
    FoodsSelectDirective,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ion-list>
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

        <ion-item>
          <app-searchable-select
            appFoodsSelect
            label="Consumptions"
            labelPlacement="stacked"
            placeholder="Choose a food"
            formControlName="food"
            searchKey="name"
            multiple="false"
            required="true"
          />
        </ion-item>
        <ion-item>
          <ion-input
            label="Quantity"
            labelPlacement="stacked"
            placeholder="Choose the daquantity of the food"
            formControlName="quantity"
          />
        </ion-item>
      </ion-list>

      <ion-button
        type="submit"
        expand="block"
        [disabled]="loading || (form.invalid && form.touched)"
      >
        {{ data ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealFormComponent {
  @Input() loading: boolean = false;

  @Input() set item(item: Meal | undefined) {
    if (!item) return;
    this.data = item;

    this.form.patchValue({
      name: item.name,
      at: item.at,
      notes: item.notes,
    });

    const consuptionArray = this.form.get('consumptions') as FormArray;
    consuptionArray.clear();

    item.consumptions.forEach(({ food, quantity }) => {
      const group = new FormGroup({
        food: new FormControl<Food | null>(food, Validators.required),
        quantity: new FormControl<number>(quantity, Validators.required),
      });
      consuptionArray.insert(0, group);
    });
  }

  protected data?: Meal;

  @Output() save = new EventEmitter();

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    at: new FormControl<Date>(new Date(), Validators.required),
    notes: new FormControl<string>(''),
    consumptions: new FormArray(
      [
        new FormGroup({
          food: new FormControl<Food | null>(null, Validators.required),
          quantity: new FormControl<number>(0, Validators.required),
        }),
      ],
      Validators.minLength(1),
    ),
  });

  protected get consumptions(): FormGroup[] {
    const formArray = this.form.get('consumptions') as FormArray;
    return formArray.controls as FormGroup[];
  }

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
