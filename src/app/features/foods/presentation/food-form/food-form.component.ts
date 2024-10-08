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
import { Ingredient } from 'src/app/features/ingredients/data-access';
import { IngredientsHandlerDirective } from 'src/app/features/ingredients/utility';
import { SearchableSelectComponent } from 'src/app/shared/presentation';
import { Food } from '../../data-access';

@Component({
  selector: 'app-food-form',
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    ReactiveFormsModule,
    IngredientsHandlerDirective,
    SearchableSelectComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ion-list>
        <ion-item>
          <ion-input
            label="Food name *"
            labelPlacement="stacked"
            placeholder="Write the name of the food"
            formControlName="name"
            required="true"
          />
        </ion-item>
        <ion-item>
          <app-searchable-select
            appIngredientsHandler
            label="Ingredients"
            labelPlacement="stacked"
            placeholder="Choose some ingredient"
            formControlName="ingredients"
            searchKey="name"
            multiple="true"
            [keys]="{}"
          />
        </ion-item>
        <ion-item>
          <ion-input
            label="Calories"
            labelPlacement="stacked"
            placeholder="Write the amount of calories"
            formControlName="calories"
            type="number"
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
      <ion-button
        type="submit"
        expand="block"
        [disabled]="loading() || (form.invalid && form.touched)"
      >
        {{ food() ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodFormComponent {
  loading = input<boolean>(false);
  food = input<Food>();

  @Output() save = new EventEmitter();

  constructor() {
    effect(
      () => {
        const food = this.food();
        if (!food) return;
        this.form.patchValue({
          name: food.name,
          ingredients: food.ingredients,
          calories: food.calories,
          notes: food.notes,
        });
      },
      { allowSignalWrites: true },
    );
  }

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    ingredients: new FormControl<Ingredient[]>([]),
    calories: new FormControl<number | null>(null),
    notes: new FormControl<string>(''),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    const formData = {
      name: this.form.value.name || '',
      ingredients: this.form.value.ingredients || [],
      calories: this.form.value.calories || null,
      notes: this.form.value.notes || '',
    };
    this.save.emit(formData);
  }
}
