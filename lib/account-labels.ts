import { TYPE_COMPTE_LABELS } from '@/lib/type-compte';
/** Libellés du socle de compte — `users.account_type` / `users.verification_status`. */

/**
 * `users.type_compte` — chez Alanya Work, ce qu'EST le compte (agent, centre…),
 * pas un rôle d'administration. Voir `lib/type-compte.ts`.
 */
export const ROLE_LABELS: Record<number, string> = TYPE_COMPTE_LABELS;

export const ACCOUNT_TYPE_LABELS: Record<number, string> = {
  0: "Personnel",
  1: "Business",
  2: "Officiel",
};

export const VERIFICATION_LABELS: Record<number, string> = {
  0: "Aucune",
  1: "En attente",
  2: "Vérifié",
  3: "Refusé",
  4: "Révoqué",
  5: "Expiré",
};
