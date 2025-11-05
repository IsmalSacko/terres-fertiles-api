import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieVenteComponent } from './saisie-vente.component';

describe('SaisieVenteComponent', () => {
  let component: SaisieVenteComponent;
  let fixture: ComponentFixture<SaisieVenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisieVenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaisieVenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
