import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonCreateComponent } from './horizon-create.component';

describe('HorizonCreateComponent', () => {
  let component: HorizonCreateComponent;
  let fixture: ComponentFixture<HorizonCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizonCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizonCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
