/**
 * Alanya Work : un Alanya ID fait de 6 à 8 chiffres (`ALANYA_ID_REGEX` du
 * backend) ; les nouveaux en font 8. Pas de « motifs réservés » : un numéro
 * est réservé parce qu'il figure dans la table des numéros réservés.
 */
const VALID_LENGTHS = [6, 7, 8] as const;

export function normalize(input: string | null | undefined): string {
  if (input == null) return '';
  return String(input).replace(/\D/g, '');
}

export function getTier(canonical: string): number | null {
  return VALID_LENGTHS.includes(canonical.length as (typeof VALID_LENGTHS)[number])
    ? canonical.length
    : null;
}

export function validate(canonical: string): string | null {
  if (!canonical) return 'Numéro Alanya requis';
  if (!/^\d+$/.test(canonical)) return 'Chiffres uniquement';
  if (!getTier(canonical)) return 'Numéro invalide : 6 à 8 chiffres';
  return null;
}

/** Forme XXYYZZTT (ex. 11223344). */
export function isXxyyzztt(canonical: string): boolean {
  return (
    canonical.length === 8 &&
    /^\d{8}$/.test(canonical) &&
    canonical[0] === canonical[1] &&
    canonical[2] === canonical[3] &&
    canonical[4] === canonical[5] &&
    canonical[6] === canonical[7]
  );
}

/** Pas de motifs réservés chez Alanya Work (voir en tête). */
export function isPatternReserved(canonical: string): boolean {
  void canonical;
  return false;
}

/** Tout Alanya ID valide peut être réservé. */
export function validateReservedCandidate(canonical: string): string | null {
  return validate(canonical);
}

function groupDigits(digits: string, groups: number[]): string {
  const parts: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + size));
    i += size;
  }
  if (i < digits.length) parts.push(digits.slice(i));
  return parts.join(' ');
}

export function formatDisplay(canonical: string | null | undefined): string {
  const digits = normalize(canonical);
  if (!digits) return '';
  // Pas de complément à 8 : un Alanya ID de 6 chiffres est un vrai numéro.
  if (digits.length <= 3) return digits;
  // 4+ : groupes de 2 (8 ch. Alanya, et numéros plus longs type indicatif)
  return groupDigits(digits, Array(Math.ceil(digits.length / 2)).fill(2));
}

export function formatLiveInput(input: string): string {
  const digits = normalize(input);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 4) return groupDigits(digits, [2, 2]);
  return groupDigits(digits.slice(0, 8), [2, 2, 2, 2]);
}

export function isCompletePhone(canonical: string): boolean {
  return validate(canonical) === null;
}

export function isAssignableQuery(q: string): boolean {
  const digits = normalize(q);
  return digits.length > 0 && isCompletePhone(digits);
}
