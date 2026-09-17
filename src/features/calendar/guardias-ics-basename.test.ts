import {
  guardiasIcsBasename,
  guardiasImageFilename,
} from './guardias-ics-basename';

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

describe('guardiasImageFilename', () => {
  it('keeps a readable label with app branding', () => {
    expect(guardiasImageFilename('Quirófano')).toBe(
      'Mi Guardia — Quirófano.png',
    );
  });

  it('strips path-unsafe characters and collapses spaces', () => {
    expect(guardiasImageFilename('  Pedia/tría  2025  ')).toBe(
      'Mi Guardia — Pediatría 2025.png',
    );
  });

  it('falls back when the label is empty after cleaning', () => {
    expect(guardiasImageFilename('***')).toBe('Mi Guardia — Rotación.png');
  });
});
