import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheAgroPedoEditComponent } from './fiche-agro-pedo-edit.component';

describe('FicheAgroPedoEditComponent', () => {
  let component: FicheAgroPedoEditComponent;
  let fixture: ComponentFixture<FicheAgroPedoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheAgroPedoEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheAgroPedoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
