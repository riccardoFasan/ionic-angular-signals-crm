import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonIcon,
  IonList,
  IonTextarea,
} from '@ionic/angular/standalone';
import { Food } from '../../data-access';
import { Ingredient } from 'src/app/features/ingredients/data-access';
import { SearchableSelectComponent } from 'src/app/shared/presentation';
import { IngredientsSelectDirective } from 'src/app/features/ingredients/utility';

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
    IngredientsSelectDirective,
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
            appIngredientsSelect
            label="Ingredients"
            labelPlacement="stacked"
            placeholder="Choose some ingredient"
            formControlName="ingredients"
            searchKey="name"
            multiple="true"
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
        [disabled]="loading || (form.invalid && form.touched)"
      >
        {{ data ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodFormComponent {
  @Input() loading: boolean = false;

  @Input() set item(item: Food | undefined) {
    if (!item) return;
    this.data = item;

    this.form.patchValue({
      name: item.name,
      ingredients: item.ingredients,
      calories: item.calories,
      notes: item.notes,
    });
  }

  protected data?: Food;

  @Output() save = new EventEmitter();

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
      calories: this.form.value.calories || 0,
      notes: this.form.value.notes || '',
    };
    this.save.emit(formData);
  }
}
