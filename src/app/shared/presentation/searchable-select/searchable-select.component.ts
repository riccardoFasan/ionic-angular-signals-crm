import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  booleanAttribute,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ListStoreService, STORE_HANDLER } from '../../data-access';
import { Option } from '../option.model';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  IonInput,
  IonIcon,
  IonModal,
  IonHeader,
  IonContent,
  IonButtons,
  IonButton,
  IonToolbar,
  IonTitle,
  IonItem,
  IonCheckbox,
  IonSearchbar,
  IonRadio,
} from '@ionic/angular/standalone';
import { ScrollableListComponent } from '../scrollable-list/scrollable-list.component';
import { OptionSelectedPipe } from '../option-selected/option-selected.pipe';

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [
    IonInput,
    IonIcon,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonItem,
    IonCheckbox,
    IonRadio,
    IonSearchbar,
    ScrollableListComponent,
    OptionSelectedPipe,
  ],
  template: `
    <ion-input
      [label]="label"
      [labelPlacement]="labelPlacement"
      [multiple]="multiple"
      [placeholder]="placeholder"
      [value]="displayLabel()"
      readonly="true"
      (click)="open.set(true)"
    >
      <ion-icon aria-hidden="true" name="caret-down-sharp" slot="end" />
    </ion-input>

    <ion-modal [isOpen]="open()" (willDismiss)="open.set(false)">
      <ng-template>
        <ion-header [translucent]="true">
          <ion-toolbar>
            <ion-buttons slot="end">
              <ion-button (click)="open.set(false)">Done</ion-button>
            </ion-buttons>
            <ion-title>
              {{ label }}
            </ion-title>
          </ion-toolbar>
          <ion-toolbar>
            <ion-searchbar
              debounce="350"
              animated="true"
              (ionInput)="onSearchInput($event)"
            />
          </ion-toolbar>
        </ion-header>
        <ion-content [fullscreen]="true">
          <app-scrollable-list
            [items]="options()"
            [canLoadNextPage]="listStore.canLoadNextPage()"
            [loading]="listStore.mode() === 'FETCHING'"
            [trackFn]="trackFn"
            (scrollEnd)="listStore.loadNextPage$.next()"
            (refresh)="listStore.refresh$.next()"
          >
            <ng-template #itemTemplate let-item>
              <ion-item>
                @if (multiple) {
                  <ion-checkbox
                    [attr.aria-label]="item.label"
                    slot="start"
                    [checked]="item | optionSelected: selected()"
                    (ionChange)="toggleOption(item)"
                  />
                } @else {
                  <ion-radio slot="start" (click)="toggleOption(item)" />
                }
                {{ item.label }}
              </ion-item>
            </ng-template>
          </app-scrollable-list>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: `
    :host {
      display: block;
      width: 100%
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ListStoreService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SearchableSelectComponent,
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements OnInit, ControlValueAccessor {
  protected listStore = inject(ListStoreService);
  protected storeHandler = inject(STORE_HANDLER);

  @Input({ required: true }) searchKey!: string;
  @Input({ transform: booleanAttribute }) multiple: boolean = false;
  @Input() label?: string;
  @Input() labelPlacement?: string;
  @Input() placeholder?: string;
  @Input({ transform: booleanAttribute }) required: boolean = false;

  protected selected = signal<Option[]>([]);
  protected open = signal<boolean>(false);

  protected options = computed<Option[]>(() =>
    this.listStore.items().map((value) => this.toOption(value)),
  );

  protected displayLabel = computed<string | null>(() => {
    const selectedOptions = this.selected();
    if (selectedOptions.length === 0) return null;
    const labels = selectedOptions.map((option) => option.label);
    return labels.join(', ');
  });

  private values = computed<unknown[]>(() =>
    this.selected().map((option) => option.value),
  );

  protected trackFn = (option: Option): number => option.ref;

  private onChange!: (value: unknown | unknown[]) => void;
  private onTouched!: () => void;

  constructor() {
    effect(() => {
      const values = this.values();
      this.onChange?.(this.multiple ? values : values[0]);
    });
  }

  ngOnInit(): void {
    this.listStore.loadFirstPage$.next();
  }

  writeValue(value: unknown | unknown[]): void {
    if (!value) {
      this.selected.set([]);
      return;
    }

    this.onTouched?.();

    if (this.multiple) {
      const values = value as unknown[];
      const selectedOptions = values.map((value) => this.toOption(value));
      this.selected.set(selectedOptions);
      return;
    }

    const option = this.toOption(value);
    this.selected.set([option]);
  }

  registerOnChange(fn: (value: unknown | unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onSearchInput(event: CustomEvent): void {
    const query = event.detail.value;
    if (query.length > 0 && query.length < 3) return;
    if (query) this.onTouched?.();
    this.listStore.filters$.next({ [this.searchKey]: query });
  }

  protected toggleOption(option: Option): void {
    const selectedOptions = this.selected();

    const isSelected = selectedOptions.some((o) => o.ref === option.ref);

    const selected = isSelected
      ? selectedOptions.filter((o) => o.ref !== option.ref)
      : [...selectedOptions, option];

    this.selected.set(selected);
  }

  private toOption(value: unknown): Option {
    const ref = this.storeHandler.extractId(value);
    const label = this.storeHandler.extractName(value);
    return { ref, label, value };
  }
}
