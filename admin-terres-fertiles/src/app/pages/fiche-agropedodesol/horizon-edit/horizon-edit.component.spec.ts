import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonEditComponent } from './horizon-edit.component';

describe('HorizonEditComponent', () => {
  let component: HorizonEditComponent;
  let fixture: ComponentFixture<HorizonEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizonEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
