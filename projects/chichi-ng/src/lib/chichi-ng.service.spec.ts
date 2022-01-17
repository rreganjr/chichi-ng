import { TestBed } from '@angular/core/testing';

import { ChichiNgService } from './chichi-ng.service';

describe('ChichiNgService', () => {
  let service: ChichiNgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChichiNgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
