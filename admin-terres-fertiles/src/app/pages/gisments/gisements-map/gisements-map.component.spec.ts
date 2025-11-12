import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GisementsMapComponent } from './gisements-map.component';

describe('GisementsMapComponent', () => {
  let component: GisementsMapComponent;
  let fixture: ComponentFixture<GisementsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GisementsMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GisementsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
