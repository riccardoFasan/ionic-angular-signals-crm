import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Consumption } from '../../data-access';
import { FoodsSelectDirective } from 'src/app/features/foods/utility';
import {
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
} from '@ionic/angular/standalone';
import { SearchableSelectComponent } from 'src/app/shared/presentation';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-consumption-input',
  standalone: true,
  imports: [
    NgClass,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItem,
    IonInput,
    IonList,
    SearchableSelectComponent,
    FoodsSelectDirective,
    FormsModule,
  ],
  template: `
    @for (consumption of consumptions(); track consumption?.food?.id) {
      <ion-list [ngClass]="{ 'ion-margin-top': !$first }">
        @if (consumptions().length > 1) {
          <ion-fab>
            <ion-fab-button>
              <ion-icon
                md="trash-bin-sharp"
                ios="trash-bin-outline"
                color="danger"
                (click)="removeConsumption($index)"
              />
            </ion-fab-button>
          </ion-fab>
        }

        <ion-item>
          <app-searchable-select
            appFoodsSelect
            label="Consumptions"
            labelPlacement="stacked"
            placeholder="Choose a food"
            searchKey="name"
            multiple="false"
            required="true"
            [ngModel]="consumption.food"
            (ngModelChange)="
              updateConsumption(
                { quantity: consumption.quantity, food: $event },
                $index
              )
            "
          />
        </ion-item>
        <ion-item>
          <ion-input
            label="Quantity"
            labelPlacement="stacked"
            placeholder="Choose the quantity of the food"
            [ngModel]="consumption.quantity"
            (ngModelChange)="
              updateConsumption(
                { food: consumption.food, quantity: $event },
                $index
              )
            "
            type="number"
          />
        </ion-item>
      </ion-list>
    }
    <ion-button
      class="ion-margin-bottom"
      size="small"
      fill="clear"
      expand="block"
      (click)="addConsumption()"
    >
      Add consumption
    </ion-button>
  `,
  styles: `
    ion-list {
      position: relative;

      ion-fab {
        position: absolute;
        transform: translate(50%, -50%);
        top: 1.25rem;
        right: 1.25rem;

        ion-fab-button {
          height: 1.5rem; 
          width: 1.5rem;
          --background: transparent;

          ion-icon {
            height: 1rem;
            width: 1rem;
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ConsumptionInputComponent,
      multi: true,
    },
  ],
})
export class ConsumptionInputComponent implements ControlValueAccessor {
  // TODO: make impossible to select the same food twice or show an error

  private readonly newConsumption: Partial<Consumption> = {};
  protected consumptions = signal<Partial<Consumption>[]>([]);

  private onChange!: (value: Consumption[]) => void;
  private onTouched!: () => void;

  writeValue(value: Consumption[] | null): void {
    if (value) this.onTouched?.();
    this.consumptions.set(value || [this.newConsumption]);
  }

  registerOnChange(fn: (value: Consumption[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected addConsumption(): void {
    this.consumptions.update((consumptions) => [
      ...consumptions,
      this.newConsumption,
    ]);
  }

  protected removeConsumption(index: number): void {
    this.consumptions.update((consumptions) =>
      consumptions.filter((_, i) => i !== index),
    );
  }

  protected updateConsumption(
    { food, quantity }: Partial<Consumption>,
    index: number,
  ): void {
    const consumptions = this.consumptions().map((c, i) =>
      i !== index ? c : { ...c, quantity, food },
    );
    this.consumptions.set(consumptions);

    // consider to replace duck typing with some feature-based utility functions
    const values = consumptions.filter(
      (consumption) =>
        typeof consumption.food?.id === 'number' &&
        typeof consumption.food?.name === 'string' &&
        typeof consumption.quantity === 'number',
    ) as Consumption[];

    this.onChange?.(values);
  }
}
