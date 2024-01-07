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
  IonList,
  IonTextarea,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-activity-type-form',
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
            label="Activity name *"
            labelPlacement="floating"
            placeholder="Write the name of the activity"
            formControlName="name"
            required="true"
          />
        </ion-item>
        <!-- TODO: icons select -->
        <!-- TODO: colors select -->
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

  @Input() set activityType(activityType: ActivityType | undefined) {
    if (!activityType) return;
    this.data = activityType;

    this.form.patchValue({
      name: activityType.name,
      icon: activityType.icon,
      color: activityType.color,
    });
  }

  protected data?: ActivityType;

  @Output() save = new EventEmitter();

  protected form: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
    icon: new FormControl(null),
    color: new FormControl(null),
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
