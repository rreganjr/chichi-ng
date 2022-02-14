import { TestBed } from '@angular/core/testing';

import { VisualSchedulerService } from './visual-scheduler.service';

describe('VisualSchedulerService', () => {
  let service: VisualSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualSchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
