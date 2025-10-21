import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheAgroPedoListComponent } from './fiche-agro-pedo-list.component';

describe('FicheAgroPedoListComponent', () => {
  let component: FicheAgroPedoListComponent;
  let fixture: ComponentFixture<FicheAgroPedoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheAgroPedoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheAgroPedoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
