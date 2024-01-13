import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ActivityType } from '../../data-access';
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
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-activity-type-form',
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonIcon,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    ReactiveFormsModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ion-list>
        <ion-item>
          <ion-input
            label="Activity name *"
            labelPlacement="stacked"
            placeholder="Write the name of the activity"
            formControlName="name"
            required="true"
          />
        </ion-item>
        <ion-item>
          <ion-select
            label="Icon"
            labelPlacement="stacked"
            formControlName="icon"
            placeholder="Choose an icon"
            interface="action-sheet"
          >
            <ion-select-option value="bycicle"> Bycicle </ion-select-option>
            <ion-select-option value="sunny"> Sunny </ion-select-option>
            <ion-select-option value="train"> Train </ion-select-option>
            <ion-select-option value="rocket"> Rocket </ion-select-option>
            <ion-select-option value="pizza"> Pizza </ion-select-option>
            <ion-select-option value="planet"> Planet </ion-select-option>
            <ion-select-option value="pulse"> Pulse </ion-select-option>
            <ion-select-option value="walk"> Walk </ion-select-option>
            <ion-select-option value="bed"> Bed </ion-select-option>
            <ion-select-option value="skull"> Skull </ion-select-option>
            <ion-select-option [value]="null">No one</ion-select-option>
          </ion-select>
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
        [disabled]="loading || (form.invalid && form.touched)"
      >
        {{ data ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityTypeFormComponent {
  @Input() loading: boolean = false;

  @Input() set item(item: ActivityType | undefined) {
    if (!item) return;
    this.data = item;

    this.form.patchValue({
      name: item.name,
      icon: item.icon,
      color: item.color,
    });
  }

  protected data?: ActivityType;

  @Output() save = new EventEmitter();

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    icon: new FormControl<string>(''),
    color: new FormControl<string>(''),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    const formData = {
      name: this.form.value.name,
      icon: this.form.value.icon || '',
      color: this.form.value.color || '',
    };
    this.save.emit(formData);
  }
}
