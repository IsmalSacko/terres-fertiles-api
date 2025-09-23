import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitVenteListComponent } from './produit-vente-list.component';

describe('ProduitVenteListComponent', () => {
  let component: ProduitVenteListComponent;
  let fixture: ComponentFixture<ProduitVenteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitVenteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitVenteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
