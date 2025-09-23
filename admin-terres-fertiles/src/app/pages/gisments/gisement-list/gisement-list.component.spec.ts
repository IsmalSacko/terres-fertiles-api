import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GisementListComponent } from './gisement-list.component';

describe('GisementListComponent', () => {
  let component: GisementListComponent;
  let fixture: ComponentFixture<GisementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GisementListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GisementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
