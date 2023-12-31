import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailIngredientModalComponent } from './detail-ingredient-modal.component';

describe('DetailIngredientModalComponent', () => {
  let component: DetailIngredientModalComponent;
  let fixture: ComponentFixture<DetailIngredientModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailIngredientModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailIngredientModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
