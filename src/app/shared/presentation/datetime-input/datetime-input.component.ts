import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  effect,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  IonBackdrop,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonModal,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-datetime-input',
  standalone: true,
  imports: [
    IonDatetime,
    IonInput,
    IonModal,
    IonBackdrop,
    IonContent,
    IonIcon,
    DatePipe,
  ],
  template: `
    <ion-input
      [label]="label"
      [labelPlacement]="labelPlacement"
      [placeholder]="placeholder"
      [value]="selected() | date: 'dd/MM/YYYY HH:mm'"
      readonly="true"
      (click)="open.set(true)"
    >
      <ion-icon
        aria-hidden="true"
        md="calendar-clear-sharp"
        ios="calendar-clear-outline"
        slot="end"
      />
    </ion-input>

    <ion-modal [isOpen]="open()" (willDismiss)="open.set(false)">
      <ng-template>
        <div class="ion-padding">
          <ion-datetime
            [value]="selected()"
            (cancel)="open.set(false)"
            (confirm)="open.set(false)"
            (ionChange)="selected.set($any($event.detail.value))"
            showDefaultButtons="true"
          />
        </div>
      </ng-template>
    </ion-modal>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;

      ion-input {
        user-select: none;
      }
    }

    ion-modal {
      &::part(content) {
        background: transparent;
      }

      &::part(backdrop) {
        --backdrop-opacity: 0.75;
      }
    }

    div:has(ion-datetime) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      width: 100%;
      background: transparent;

      ion-datetime {
        max-width: unset;
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
  @Input() label?: string;
  @Input() labelPlacement?: string;
  @Input() placeholder?: string;

  protected selected = signal<string | null>(null);

  protected value = computed<Date | null>(() => {
    const selected = this.selected();
    if (!selected) return null;
    return new Date(selected);
  });

  protected open = signal<boolean>(false);

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
}
