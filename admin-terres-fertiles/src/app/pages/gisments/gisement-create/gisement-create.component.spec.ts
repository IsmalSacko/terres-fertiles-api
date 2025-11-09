import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GisementCreateComponent } from './gisement-create.component';

describe('GisementCreateComponent', () => {
  let component: GisementCreateComponent;
  let fixture: ComponentFixture<GisementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GisementCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GisementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
