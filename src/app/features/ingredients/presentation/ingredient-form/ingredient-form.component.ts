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
  IonInput,
  IonItem,
  IonList,
  IonTextarea,
} from '@ionic/angular/standalone';
import { Ingredient } from '../../data-access';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    ReactiveFormsModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ion-list>
        <ion-item>
          <ion-input
            label="Ingredient name *"
            labelPlacement="stacked"
            placeholder="Write the name of the ingredient"
            formControlName="name"
            required="true"
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
        {{ ingredient() ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientFormComponent {
  loading = input<boolean>(false);
  ingredient = input<Ingredient>();

  constructor() {
    effect(
      () => {
        const ingredient = this.ingredient();
        if (!ingredient) return;
        this.form.patchValue({
          name: ingredient.name,
          notes: ingredient.notes,
        });
      },
      { allowSignalWrites: true },
    );
  }

  @Output() save = new EventEmitter();

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    notes: new FormControl<string>(''),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    const formData = {
      name: this.form.value.name,
      notes: this.form.value.notes || '',
    };
    this.save.emit(formData);
  }
}
