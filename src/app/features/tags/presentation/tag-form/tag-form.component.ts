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
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { Tag } from '../../data-access';

@Component({
  selector: 'app-tag-form',
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonIcon,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ion-list>
        <ion-item>
          <ion-input
            label="Tag name *"
            labelPlacement="stacked"
            placeholder="Write the name of the tag"
            formControlName="name"
            required="true"
          />
        </ion-item>

        <ion-item>
          <ion-select
            label="Color"
            labelPlacement="stacked"
            formControlName="color"
            placeholder="Choose a color"
            interface="action-sheet"
          >
            <ion-select-option value="red">Red</ion-select-option>
            <ion-select-option value="green">Green</ion-select-option>
            <ion-select-option value="yellow">Yellow</ion-select-option>
            <ion-select-option value="blue">Blue</ion-select-option>
            <ion-select-option value="orange">Orange</ion-select-option>
            <ion-select-option value="black">Black</ion-select-option>
            <ion-select-option value="white">White</ion-select-option>
            <ion-select-option [value]="null">No one</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
      <ion-button
        type="submit"
        expand="block"
        [disabled]="loading() || (form.invalid && form.touched)"
      >
        {{ tag() ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFormComponent {
  loading = input<boolean>(false);
  tag = input<Tag>();

  constructor() {
    effect(
      () => {
        const tag = this.tag();
        if (!tag) return;
        this.form.patchValue({
          name: tag.name,
          color: tag.color,
        });
      },
      { allowSignalWrites: true },
    );
  }

  @Output() save = new EventEmitter();

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    color: new FormControl<string>(''),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    const formData = {
      name: this.form.value.name || '',
      color: this.form.value.color || '',
    };
    this.save.emit(formData);
  }
}
