import { guardiasIcsBasename } from './guardias-ics-basename';

describe('guardiasIcsBasename', () => {
  it('slugifies the label and appends -guardias', () => {
    expect(guardiasIcsBasename('Internal medicine')).toBe(
      'internalmedicine-guardias',
    );
  });

  it('strips accents and punctuation', () => {
    expect(guardiasIcsBasename('Pediatría – Jan 2025')).toBe(
      'pediatriajan2025-guardias',
    );
  });

  it('falls back when the label has no letters', () => {
    expect(guardiasIcsBasename('!!!')).toBe('shifts-guardias');
  });
});
