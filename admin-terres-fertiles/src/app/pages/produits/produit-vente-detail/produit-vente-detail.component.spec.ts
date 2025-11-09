import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitVenteDetailComponent } from './produit-vente-detail.component';

describe('ProduitVenteDetailComponent', () => {
  let component: ProduitVenteDetailComponent;
  let fixture: ComponentFixture<ProduitVenteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitVenteDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitVenteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
