import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseLaboratoireDetailComponent } from './analyse-laboratoire-detail.component';

describe('AnalyseLaboratoireDetailComponent', () => {
  let component: AnalyseLaboratoireDetailComponent;
  let fixture: ComponentFixture<AnalyseLaboratoireDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyseLaboratoireDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyseLaboratoireDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
