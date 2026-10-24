/**
 * Les écrans qu'un bouton peut ouvrir dans l'application — ceux de la
 * console d'Alanya2026. Partagés par le bloc « Boutons » de la bienvenue et
 * les boutons d'une diffusion ; le serveur refuse tout autre écran.
 */
export const ROUTE_OPTIONS = [
  { value: "profile", label: "Profil" },
  { value: "statuses", label: "Statuts" },
  { value: "help", label: "Aide et FAQ" },
];

/** Un lien de bouton n'est accepté qu'en http(s), comme côté serveur. */
export function lienHttpValide(cible: string): boolean {
  try {
    const u = new URL(cible.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
