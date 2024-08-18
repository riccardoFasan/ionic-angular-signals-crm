import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import {
  DetailStoreService,
  Operation,
  OperationType,
} from 'src/app/shared/data-access';
import { DetailModalWrapperComponent } from 'src/app/shared/presentation';
import { TagFormComponent } from '../tag-form/tag-form.component';
import { CreateTagFormData, UpdateTagFormData } from '../../data-access';
import { TagsHandlerDirective } from '../../utility';

@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [IonButton, DetailModalWrapperComponent, TagFormComponent],
  template: `
    <app-detail-modal-wrapper
      [loading]="
        detailStore.mode() === 'PROCESSING' || detailStore.mode() === 'FETCHING'
      "
      [title]="title()"
      (refresh)="detailStore.refresh$.next()"
    >
      <ng-container ngProjectAs="[buttons]">
        @if (detailStore.item()) {
          <ion-button (click)="remove()">Delete</ion-button>
        }
        <ion-button (click)="modalCtrl.dismiss()">Close</ion-button>
      </ng-container>
      <app-tag-form
        [loading]="detailStore.mode() === 'PROCESSING'"
        (save)="save($event)"
        [tag]="detailStore.item()"
      />
    </app-detail-modal-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [TagsHandlerDirective],
  providers: [DetailStoreService],
})
export class TagModalComponent implements OnInit {
  protected detailStore = inject(DetailStoreService);
  protected modalCtrl = inject(ModalController);

  private id!: number;

  protected title = computed<string>(() => {
    const itemName = this.detailStore.item()?.name;
    return itemName ? `Edit ${itemName}` : 'Create tag';
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.detailStore.pk$.next(this.id);
  }

  protected save(payload: CreateTagFormData | UpdateTagFormData): void {
    const operation: Operation = {
      type: this.detailStore.item()
        ? OperationType.Update
        : OperationType.Create,
      payload,
    };
    this.detailStore.operation$.next(operation);
  }

  protected remove(): void {
    if (!this.detailStore.item()) return;
    this.detailStore.operation$.next({ type: OperationType.Delete });
    this.modalCtrl.dismiss();
  }
}
