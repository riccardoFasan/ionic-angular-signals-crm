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
import { ActivityType } from 'src/app/features/activity-types/data-access';
import { ActivityTypesHandlerDirective } from 'src/app/features/activity-types/utility';
import { Tag } from 'src/app/features/tags/data-access';
import { TagsHandlerDirective } from 'src/app/features/tags/utility';
import {
  DatetimeInputComponent,
  SearchableSelectComponent,
} from 'src/app/shared/presentation';
import { Activity } from '../../data-access';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    ReactiveFormsModule,
    ActivityTypesHandlerDirective,
    TagsHandlerDirective,
    SearchableSelectComponent,
    DatetimeInputComponent,
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
          <app-datetime-input
            label="At *"
            labelPlacement="stacked"
            placeholder="Start date of the activity"
            formControlName="at"
          />
        </ion-item>
        <ion-item>
          <app-datetime-input
            label="End"
            labelPlacement="stacked"
            placeholder="End date of the activity (optional)"
            formControlName="end"
          />
        </ion-item>
        <ion-item>
          <app-searchable-select
            appActivityTypesHandler
            label="Activity type *"
            labelPlacement="stacked"
            placeholder="Choose an activity type"
            formControlName="type"
            searchKey="name"
            multiple="false"
            required="true"
            [keys]="{}"
          />
        </ion-item>
        <ion-item>
          <app-searchable-select
            appTagsHandler
            label="Tags"
            labelPlacement="stacked"
            placeholder="Choose some tag"
            formControlName="tags"
            searchKey="name"
            multiple="true"
            [keys]="{}"
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
        {{ activity() ? 'Edit' : 'Create' }}
      </ion-button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFormComponent {
  loading = input<boolean>(false);
  activity = input<Activity>();

  @Output() save = new EventEmitter();

  constructor() {
    effect(
      () => {
        const activity = this.activity();
        if (!activity) return;
        this.form.patchValue({
          name: activity.name,
          at: activity.at,
          end: activity.end,
          type: activity.type,
          notes: activity.notes,
          tags: activity.tags,
        });
      },
      { allowSignalWrites: true },
    );
  }

  protected form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    at: new FormControl<Date>(new Date(), Validators.required),
    end: new FormControl<Date | null>(null),
    type: new FormControl<ActivityType | null>(null, Validators.required),
    tags: new FormControl<Tag[]>([]),
    notes: new FormControl<string>(''),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    const formData = {
      name: this.form.value.name || '',
      at: this.form.value.at || new Date(),
      end: this.form.value.end || '',
      type: this.form.value.type || '',
      tags: this.form.value.tags || [],
      notes: this.form.value.notes || '',
    };
    this.save.emit(formData);
  }
}
