/**
 * Les types de compte d'Alanya Work (`users.type_compte`) — ce qu'EST le
 * compte, pas un rôle d'administration. Miroir de
 * `backend-alanya/src/lib/e2ee-perimetre.ts`.
 */
export const TYPE_COMPTE_LABELS: Record<number, string> = {
  0: "Personne",
  2: "Agent d'entreprise",
  3: "Centre d'appels",
  4: "Centre vocal",
  5: "Compte officiel",
  9: "Modérateur",
};

/** Les types qu'une diffusion peut viser (jamais le compte officiel lui-même). */
export const TYPES_COMPTE_CIBLABLES = [0, 2, 3, 4, 9] as const;

export function libelleTypeCompte(t: number | null | undefined): string {
  return t == null ? "—" : (TYPE_COMPTE_LABELS[t] ?? `Type ${t}`);
}
