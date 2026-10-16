import { describe, it, expect } from 'vitest';
import {
  normalize,
  getTier,
  validate,
  isPatternReserved,
  validateReservedCandidate,
  formatDisplay,
  formatLiveInput,
  isCompletePhone,
  isAssignableQuery,
} from './alanya-phone';

describe('normalize', () => {
  it('retire tout sauf les chiffres', () => {
    expect(normalize('+33 6 12-34')).toBe('3361234');
    expect(normalize('abc')).toBe('');
  });
  it('gère null/undefined', () => {
    expect(normalize(null)).toBe('');
    expect(normalize(undefined)).toBe('');
  });
});

describe('getTier / validate — Alanya ID de 6 à 8 chiffres', () => {
  it('6, 7 et 8 chiffres sont acceptés', () => {
    expect(getTier('123456')).toBe(6);
    expect(getTier('1234567')).toBe(7);
    expect(getTier('12345678')).toBe(8);
  });
  it('les autres longueurs sont refusées', () => {
    expect(getTier('123')).toBeNull();
    expect(getTier('123456789')).toBeNull();
    expect(validate('12345')).toMatch(/6 à 8/);
    expect(validate('12a3')).toMatch(/Chiffres uniquement/);
    expect(validate('')).toMatch(/requis/);
    expect(validate('12345678')).toBeNull();
  });
});

describe('réservation', () => {
  it("pas de motif réservé : c'est la table qui décide", () => {
    expect(isPatternReserved('11223344')).toBe(false);
    expect(isPatternReserved('123')).toBe(false);
  });
  it('tout Alanya ID valide peut être réservé', () => {
    expect(validateReservedCandidate('87654321')).toBeNull();
    expect(validateReservedCandidate('123')).toMatch(/6 à 8/);
  });
});

describe('affichage', () => {
  it('groupe par deux, sans compléter un numéro de 6 chiffres', () => {
    expect(formatDisplay('12345678')).toBe('12 34 56 78');
    expect(formatDisplay('123456')).toBe('12 34 56');
  });
  it('saisie en direct : 8 chiffres au plus', () => {
    expect(formatLiveInput('1234567890')).toBe('12 34 56 78');
  });
  it('complet = valide', () => {
    expect(isCompletePhone('12345678')).toBe(true);
    expect(isCompletePhone('1234')).toBe(false);
    expect(isAssignableQuery('12 34 56 78')).toBe(true);
  });
});
