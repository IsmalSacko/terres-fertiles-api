import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSaisieVenteComponent } from './detail-saisie-vente.component';

describe('DetailSaisieVenteComponent', () => {
  let component: DetailSaisieVenteComponent;
  let fixture: ComponentFixture<DetailSaisieVenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSaisieVenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailSaisieVenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
