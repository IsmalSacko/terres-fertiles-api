import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseLaboratoireListComponent } from './analyse-laboratoire-list.component';

describe('AnalyseLaboratoireListComponent', () => {
  let component: AnalyseLaboratoireListComponent;
  let fixture: ComponentFixture<AnalyseLaboratoireListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyseLaboratoireListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyseLaboratoireListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
