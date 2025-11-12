import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GisementDetailComponent } from './gisement-detail.component';

describe('GisementDetailComponent', () => {
  let component: GisementDetailComponent;
  let fixture: ComponentFixture<GisementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GisementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GisementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
