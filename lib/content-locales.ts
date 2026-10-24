/**
 * Langues du contenu officiel — miroir de
 * `Alanya-Backend/src/utils/localeContent.js`.
 *
 * Les deux listes doivent rester alignées : le backend refuse une publication
 * à laquelle il manque une langue requise, et l'éditeur doit refuser avant lui
 * plutôt que de laisser l'administrateur découvrir l'erreur au moment d'envoyer.
 *
 * Ajouter une langue ici et côté backend suffit désormais : plus de colonne
 * `_xx` à poser sur trois tables, plus d'onglet à câbler à la main.
 */
export const CONTENT_LOCALES = ["fr", "en", "zh"] as const;

export type ContentLocale = (typeof CONTENT_LOCALES)[number];

/** Langues dont la saisie est obligatoire pour publier. */
export const REQUIRED_CONTENT_LOCALES: readonly ContentLocale[] = ["fr", "en"];

/**
 * Libellés d'onglets, dans la langue elle-même.
 *
 * Comme dans l'application : on cherche « 中文 », pas « Chinois ».
 */
export const CONTENT_LOCALE_LABELS: Record<ContentLocale, string> = {
  fr: "Français",
  en: "English",
  zh: "中文",
};

/**
 * « Français et English » — les langues à remplir, nommées pour l'interface.
 *
 * Construit depuis les constantes : ajouter une langue requise met à jour tous
 * les textes d'un coup, au lieu de laisser derrière soi des « traduction
 * anglaise obligatoire » devenus faux.
 */
export const REQUIRED_LOCALE_NAMES = REQUIRED_CONTENT_LOCALES.map(
  (l) => CONTENT_LOCALE_LABELS[l],
).join(" et ");

/**
 * Ordre de repli quand une traduction manque — miroir de `FALLBACK_CHAIN`.
 *
 * Un lecteur chinois sans version chinoise voit l'anglais, pas le français.
 */
export const FALLBACK_CHAIN: readonly ContentLocale[] = ["en", "fr"];

/** Traductions d'un contenu, par locale. Les langues facultatives peuvent manquer. */
export type Translations = Partial<Record<ContentLocale, string>>;

/** La locale est-elle obligatoire pour publier ? */
export function isRequiredLocale(locale: ContentLocale): boolean {
  return REQUIRED_CONTENT_LOCALES.includes(locale);
}

/**
 * Locales requises encore vides — ce qui bloque la publication.
 * Retourne un tableau vide quand tout est saisi.
 */
export function missingRequiredLocales(t: Translations): ContentLocale[] {
  return REQUIRED_CONTENT_LOCALES.filter((l) => !t[l]?.trim());
}

/**
 * Langues requises manquantes sur un contenu **qui porte du texte**.
 *
 * Un contenu vide dans toutes les langues ne réclame rien : une légende absente
 * est légitime sur un bloc image ou vidéo, et ne doit pas bloquer la
 * publication. Dès qu'une langue est saisie — fût-elle facultative — toutes les
 * langues requises le deviennent.
 *
 * Miroir de `untranslatedRequiredLocales`
 * (Alanya-Backend/src/utils/localeContent.js) : l'éditeur doit refuser avec la
 * même règle que le serveur, sinon l'administrateur découvre le refus à l'envoi.
 */
export function untranslatedRequiredLocales(
  t: Translations | null | undefined,
): ContentLocale[] {
  const filled = (l: ContentLocale) => !!t?.[l]?.trim();
  if (!CONTENT_LOCALES.some(filled)) return [];
  return REQUIRED_CONTENT_LOCALES.filter((l) => !filled(l));
}

/**
 * Résout un contenu localisé — miroir de `resolveI18n`.
 *
 * Parcourt : locale demandée → chaîne de repli → première valeur non vide.
 * Le dernier maillon compte : un contenu saisi dans une seule langue vaut
 * mieux qu'un aperçu vide.
 */
export function resolveTranslation(
  t: Translations,
  lang: ContentLocale,
): string {
  const ordered: ContentLocale[] = [
    lang,
    ...FALLBACK_CHAIN.filter((l) => l !== lang),
  ];
  for (const loc of ordered) {
    const v = t[loc];
    if (v != null && v.trim() !== "") return v;
  }
  for (const loc of CONTENT_LOCALES) {
    const v = t[loc];
    if (v != null && v.trim() !== "") return v;
  }
  return "";
}
