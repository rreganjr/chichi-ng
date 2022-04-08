import { AgendaItemOutOfBounds } from './agenda-item-out-of-bounds.error';

describe('AgendaItemOutOfBounds', () => {
  it('should create an instance', () => {
    expect(new AgendaItemOutOfBounds()).toBeTruthy();
  });
});
