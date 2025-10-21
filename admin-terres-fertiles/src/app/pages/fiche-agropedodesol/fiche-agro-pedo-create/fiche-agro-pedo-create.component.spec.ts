import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheAgroPedoCreateComponent } from './fiche-agro-pedo-create.component';

describe('FicheAgroPedoCreateComponent', () => {
  let component: FicheAgroPedoCreateComponent;
  let fixture: ComponentFixture<FicheAgroPedoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheAgroPedoCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheAgroPedoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
