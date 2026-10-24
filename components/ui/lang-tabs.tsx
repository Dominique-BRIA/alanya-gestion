"use client";

import {
  CONTENT_LOCALES,
  CONTENT_LOCALE_LABELS,
  isRequiredLocale,
  type ContentLocale,
  type Translations,
} from "@/lib/content-locales";

interface LangTabsProps {
  value: ContentLocale;
  onChange: (lang: ContentLocale) => void;
  className?: string;
  /**
   * Contenu saisi, pour signaler visuellement ce qui manque.
   *
   * Une pastille marque une langue **requise** encore vide : l'administrateur
   * voit ce qui bloque la publication sans avoir à ouvrir chaque onglet. Les
   * langues facultatives ne sont jamais signalées — leur absence est couverte
   * par la chaîne de repli, pas une erreur.
   */
  translations?: Translations;
}

export function LangTabs({
  value,
  onChange,
  className = "",
  translations,
}: LangTabsProps) {
  return (
    <div
      className={`flex gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-fit ${className}`}
    >
      {CONTENT_LOCALES.map((l) => {
        const missing =
          translations != null &&
          isRequiredLocale(l) &&
          !translations[l]?.trim();
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              value === l
                ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {CONTENT_LOCALE_LABELS[l]}
            {missing && (
              <span
                aria-label="traduction requise manquante"
                className="w-1.5 h-1.5 rounded-full bg-amber-500"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
