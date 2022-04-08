import { AgendaItemConflicts } from './agenda-item-conflicts.error';

describe('AgendaItemConflicts', () => {
  it('should create an instance', () => {
    expect(new AgendaItemConflicts()).toBeTruthy();
  });
});
