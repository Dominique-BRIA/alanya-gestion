"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import type { AppTheme, PreviewLang } from "./types";
import { CONTENT_LOCALES } from "@/lib/content-locales";

/**
 * Bascule clair / sombre de l'aperçu.
 *
 * Volontairement indépendante du thème de l'admin : on doit pouvoir contrôler
 * le rendu sombre de l'app en travaillant dans une interface claire — c'est là
 * que se cachent les erreurs de contraste, l'indigo passant de #3F51B5 à
 * #9FA8DA.
 */
export function AppThemeToggle({
  value,
  onChange,
  /** Icônes seules — la colonne latérale ne fait que 380 px de large. */
  compact = false,
  className,
}: {
  value: AppTheme;
  onChange: (t: AppTheme) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Thème de l'aperçu"
      className={cn("flex w-fit gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800", className)}
    >
      {(
        [
          { key: "light" as const, Icon: Sun, label: "Clair" },
          { key: "dark" as const, Icon: Moon, label: "Sombre" },
        ]
      ).map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          aria-label={label}
          title={`Aperçu en mode ${label.toLowerCase()}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md py-1 text-xs font-medium transition-colors",
            compact ? "px-2" : "px-2.5",
            value === key
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {compact ? null : label}
        </button>
      ))}
    </div>
  );
}

/**
 * Onglets FR / EN compacts pour la barre d'aperçu.
 *
 * `LangTabs` existe déjà mais affiche « Français » / « English » en toutes
 * lettres : trop large pour la colonne latérale.
 */
export function LangToggle({
  value,
  onChange,
  className,
}: {
  value: PreviewLang;
  onChange: (l: PreviewLang) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Langue de l'aperçu"
      className={cn("flex w-fit gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800", className)}
    >
      {CONTENT_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={value === l}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors",
            value === l
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
