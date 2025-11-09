import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlateformeComponent } from './create-plateforme.component';

describe('CreatePlateformeComponent', () => {
  let component: CreatePlateformeComponent;
  let fixture: ComponentFixture<CreatePlateformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlateformeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlateformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
