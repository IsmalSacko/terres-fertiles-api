import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPlateformeComponent } from './list-plateforme.component';

describe('ListPlateformeComponent', () => {
  let component: ListPlateformeComponent;
  let fixture: ComponentFixture<ListPlateformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPlateformeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPlateformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
