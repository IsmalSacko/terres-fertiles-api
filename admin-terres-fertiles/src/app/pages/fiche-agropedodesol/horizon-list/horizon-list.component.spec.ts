import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonListComponent } from './horizon-list.component';

describe('HorizonListComponent', () => {
  let component: HorizonListComponent;
  let fixture: ComponentFixture<HorizonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizonListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
