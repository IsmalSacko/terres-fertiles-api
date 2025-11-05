import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSaisieVenteComponent } from './edit-saisie-vente.component';

describe('EditSaisieVenteComponent', () => {
  let component: EditSaisieVenteComponent;
  let fixture: ComponentFixture<EditSaisieVenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSaisieVenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSaisieVenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
