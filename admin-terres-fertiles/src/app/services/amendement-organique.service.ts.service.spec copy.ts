import { TestBed } from '@angular/core/testing';

import { AmendementOrganiqueServiceTsService } from './amendement-organique.service.ts.service';

describe('AmendementOrganiqueServiceTsService', () => {
  let service: AmendementOrganiqueServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmendementOrganiqueServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
