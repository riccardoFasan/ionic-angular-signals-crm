import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Activity } from '../../data-access';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivityType } from 'src/app/features/activity-types/data-access';
import { Tag } from 'src/app/features/tags/data-access';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonTextarea,
} from '@ionic/angular/standalone';
import { ActivityTypesSelectDirective } from 'src/app/features/activity-types/utility';
import {
  DatetimeInputComponent,
  SearchableSelectComponent,
} from 'src/app/shared/presentation';
import { TagsSelectDirective } from 'src/app/features/tags/utility';

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
    ActivityTypesSelectDirective,
    TagsSelectDirective,
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
            appActivityTypesSelect
            label="Activity type *"
            labelPlacement="stacked"
            placeholder="Choose an activity type"
            formControlName="type"
            searchKey="name"
            multiple="false"
            required="true"
          />
        </ion-item>
        <ion-item>
          <app-searchable-select
            appTagsSelect
            label="Tags"
            labelPlacement="stacked"
            placeholder="Choose some tag"
            formControlName="tags"
            searchKey="name"
            multiple="true"
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
export class ActivityFormComponent {
  @Input() loading: boolean = false;

  @Input() set item(item: Activity | undefined) {
    if (!item) return;
    this.data = item;

    this.form.patchValue({
      name: item.name,
      at: item.at,
      end: item.end,
      type: item.type,
      notes: item.notes,
      tags: item.tags,
    });
  }

  protected data?: Activity;

  @Output() save = new EventEmitter();

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
