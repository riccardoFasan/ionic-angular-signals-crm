import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailModalWrapperComponent } from './detail-modal-wrapper.component';

describe('DetailModalWrapperComponent', () => {
  let component: DetailModalWrapperComponent;
  let fixture: ComponentFixture<DetailModalWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailModalWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailModalWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
