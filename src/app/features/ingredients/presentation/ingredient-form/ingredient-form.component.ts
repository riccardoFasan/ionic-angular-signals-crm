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
            labelPlacement="floating"
            placeholder="Write the name of the ingredient"
            formControlName="name"
            required="true"
          />
        </ion-item>
        <ion-item>
          <ion-textarea
            label="Notes"
            labelPlacement="floating"
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
        Save
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientFormComponent {
  @Input() loading: boolean = false;

  @Input() set ingredient(ingredient: Ingredient | undefined) {
    if (!ingredient) return;

    this.form.patchValue({
      name: ingredient.name,
      notes: ingredient.notes,
    });
  }

  @Output() save = new EventEmitter();

  protected form: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    notes: new FormControl(null),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.value);
  }
}
