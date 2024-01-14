import { Injectable, inject } from '@angular/core';
import { StoreHandler } from 'src/app/shared/data-access';
import { Observable, defer } from 'rxjs';
import { SearchCriteria, List } from 'src/app/shared/utility';
import { DiaryEvent } from '../diary-event.model';
import { DiaryFacadeService } from '../diary-facade/diary-facade.service';

@Injectable({
  providedIn: 'root',
})
export class DiaryHandlerService implements StoreHandler<DiaryEvent> {
  private diaryFacade = inject(DiaryFacadeService);

  extractId(item: DiaryEvent): number {
    return item.id;
  }

  extractName(item: DiaryEvent): string {
    return item.name;
  }

  get(): Observable<DiaryEvent> {
    throw new Error('Method not implemented.');
  }

  getList(searchCriteria: SearchCriteria): Observable<List<DiaryEvent>> {
    return defer(() => this.diaryFacade.getList(searchCriteria));
  }

  operate(): Observable<DiaryEvent> {
    throw new Error('Method not implemented.');
  }

  onOperation(): Observable<void> {
    throw new Error('Method not implemented.');
  }

  interpretError?(): string | undefined {
    throw new Error('Method not implemented.');
  }
}
