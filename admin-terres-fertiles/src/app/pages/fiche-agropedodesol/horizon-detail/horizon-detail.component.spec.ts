import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonDetailComponent } from './horizon-detail.component';

describe('HorizonDetailComponent', () => {
  let component: HorizonDetailComponent;
  let fixture: ComponentFixture<HorizonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizonDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizonDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
