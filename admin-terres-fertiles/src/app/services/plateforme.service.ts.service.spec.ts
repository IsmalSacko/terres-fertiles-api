import { TestBed } from '@angular/core/testing';

import { PlateformeServiceTsService } from './plateforme.service.ts.service';

describe('PlateformeServiceTsService', () => {
  let service: PlateformeServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlateformeServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
