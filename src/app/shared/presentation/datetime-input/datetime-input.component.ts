import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonIcon, IonInput } from '@ionic/angular/standalone';
import { ModalsService } from '../modals/modals.service';

@Component({
  selector: 'app-datetime-input',
  standalone: true,
  imports: [IonInput, IonIcon, DatePipe],
  template: `
    <ion-input
      [label]="label()"
      [labelPlacement]="labelPlacement()"
      [placeholder]="placeholder()"
      [value]="selected() | date: 'dd/MM/YYYY HH:mm'"
      (click)="askDatetime($event)"
      readonly="true"
    >
      <ion-icon
        aria-hidden="true"
        md="calendar-clear-sharp"
        ios="calendar-clear-outline"
        slot="end"
      />
    </ion-input>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;

      ion-input {
        user-select: none;
        z-index: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DatetimeInputComponent,
      multi: true,
    },
  ],
})
export class DatetimeInputComponent implements ControlValueAccessor {
  private modals = inject(ModalsService);

  label = input<string>();
  labelPlacement = input<string>();
  placeholder = input<string>();

  protected selected = signal<string | null>(null);

  protected value = computed<Date | null>(() => {
    const selected = this.selected();
    if (!selected) return null;
    return new Date(selected);
  });

  private onChange!: (value: Date | null) => void;
  private onTouched!: () => void;

  constructor() {
    effect(() => this.onChange?.(this.value()));
  }

  writeValue(value: unknown | unknown[]): void {
    if (!value || !(value instanceof Date)) {
      this.selected.set(null);
      return;
    }

    const selected = value.toISOString();

    this.onTouched?.();
    this.selected.set(selected);
  }

  registerOnChange(fn: (value: unknown | unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected async askDatetime(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const result = await this.modals.askDatetime(this.selected() || undefined);
    if (result) this.selected.set(result);
  }
}
