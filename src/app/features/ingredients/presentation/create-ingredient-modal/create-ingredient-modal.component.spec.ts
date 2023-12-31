import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIngredientModalComponent } from './create-ingredient-modal.component';

describe('CreateIngredientModalComponent', () => {
  let component: CreateIngredientModalComponent;
  let fixture: ComponentFixture<CreateIngredientModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIngredientModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateIngredientModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
