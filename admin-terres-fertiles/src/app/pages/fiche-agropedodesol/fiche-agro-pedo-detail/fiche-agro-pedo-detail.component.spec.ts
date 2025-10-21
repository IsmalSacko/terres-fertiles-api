import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheAgroPedoDetailComponent } from './fiche-agro-pedo-detail.component';

describe('FicheAgroPedoDetailComponent', () => {
  let component: FicheAgroPedoDetailComponent;
  let fixture: ComponentFixture<FicheAgroPedoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheAgroPedoDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheAgroPedoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
