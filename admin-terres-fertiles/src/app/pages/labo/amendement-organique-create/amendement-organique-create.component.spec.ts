import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendementOrganiqueCreateComponent } from './amendement-organique-create.component';

describe('AmendementOrganiqueCreateComponent', () => {
  let component: AmendementOrganiqueCreateComponent;
  let fixture: ComponentFixture<AmendementOrganiqueCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmendementOrganiqueCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmendementOrganiqueCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
