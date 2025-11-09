import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MelangeListComponent } from './melange-list.component';

describe('MelangeListComponent', () => {
  let component: MelangeListComponent;
  let fixture: ComponentFixture<MelangeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MelangeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MelangeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
