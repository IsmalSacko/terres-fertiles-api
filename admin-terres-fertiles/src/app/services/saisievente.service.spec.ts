import { TestBed } from '@angular/core/testing';

import { SaisieventeService } from './saisievente.service';

describe('SaisieventeService', () => {
  let service: SaisieventeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaisieventeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
