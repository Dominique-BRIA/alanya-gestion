"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditorialAssist } from "@/components/ui/editorial-assist";
import { Input } from "@/components/ui/input";
import type { PreviewLang } from "@/components/preview/types";
import {
  CONTENT_LOCALE_LABELS,
  untranslatedRequiredLocales,
  type Translations,
} from "@/lib/content-locales";
import { lienHttpValide, ROUTE_OPTIONS } from "@/lib/cta-routes";
import { cn } from "@/lib/utils";
import type { BroadcastButton } from "@/types";

/** Comme WhatsApp, et comme le serveur l'exige : trois boutons au plus. */
export const BROADCAST_BUTTONS_MAX = 3;

/**
 * Ce qui empêche ces boutons de partir — le serveur refuse la diffusion
 * entière pour un seul bouton invalide, mieux vaut le dire avant.
 */
export function broadcastButtonErrors(buttons: BroadcastButton[]): string[] {
  const errors: string[] = [];
  buttons.forEach((b, i) => {
    const n = i + 1;
    const missing = untranslatedRequiredLocales(b.labels);
    const empty = !Object.values(b.labels).some((v) => v?.trim());
    if (empty || missing.length) {
      errors.push(
        `Bouton ${n} : libellé obligatoire en ${(empty ? (["fr", "en"] as const) : missing)
          .map((l) => CONTENT_LOCALE_LABELS[l])
          .join(", ")}.`,
      );
    }
    if (b.action === "url" && !lienHttpValide(b.target)) {
      errors.push(`Bouton ${n} : le lien doit commencer par https://.`);
    }
  });
  return errors;
}

/**
 * LES BOUTONS D'UNE DIFFUSION (24/10/2026) — même éditeur que le bloc
 * « Boutons » de la bienvenue : un libellé par langue (l'onglet de langue du
 * contenu), un écran de l'application ou un lien.
 *
 * Ils arrivent juste sous le message de la diffusion, en message à part —
 * exactement comme ceux de la bienvenue. Pas de bouton sur un statut.
 */
export function BroadcastButtonsEditor({
  buttons,
  onChange,
  lang,
  disabled,
}: {
  buttons: BroadcastButton[];
  onChange: (buttons: BroadcastButton[]) => void;
  lang: PreviewLang;
  disabled?: boolean;
}) {
  const update = (i: number, patch: Partial<BroadcastButton>) =>
    onChange(buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-3">
      {buttons.map((btn, bi) => {
        const missing = untranslatedRequiredLocales(btn.labels);
        const badLink = btn.action === "url" && !lienHttpValide(btn.target);
        return (
          <div
            key={bi}
            className={cn(
              "space-y-2 rounded-lg border p-3",
              missing.length || badLink
                ? "border-amber-300 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20"
                : "border-zinc-100 dark:border-zinc-800",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Bouton {bi + 1}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                aria-label="Supprimer le bouton"
                disabled={disabled}
                onClick={() => onChange(buttons.filter((_, j) => j !== bi))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Input
              placeholder={`Libellé ${lang.toUpperCase()}`}
              value={btn.labels[lang] ?? ""}
              maxLength={60}
              disabled={disabled}
              onChange={(e) => update(bi, { labels: { ...btn.labels, [lang]: e.target.value } })}
            />
            <select
              aria-label={`Destination du bouton ${bi + 1}`}
              className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-2 text-sm dark:border-zinc-700"
              value={btn.action === "url" ? "url" : `route:${btn.target}`}
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "url") update(bi, { action: "url", target: "https://" });
                else if (v.startsWith("route:")) update(bi, { action: "route", target: v.slice(6) });
              }}
            >
              {ROUTE_OPTIONS.map((o) => (
                <option key={o.value} value={`route:${o.value}`}>
                  {o.label}
                </option>
              ))}
              <option value="url">URL externe</option>
            </select>
            {btn.action === "url" && (
              <Input
                placeholder="https://…"
                value={btn.target}
                disabled={disabled}
                onChange={(e) => update(bi, { target: e.target.value })}
              />
            )}
            {missing.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Libellé obligatoire en {missing.map((l) => CONTENT_LOCALE_LABELS[l]).join(", ")}.
              </p>
            )}
            {badLink && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Le lien doit commencer par https://.
              </p>
            )}
            <EditorialAssist
              translations={btn.labels}
              kind="cta"
              disabled={disabled}
              showReview={false}
              onApply={(t: Translations) => update(bi, { labels: { ...btn.labels, ...t } })}
            />
          </div>
        );
      })}
      {buttons.length < BROADCAST_BUTTONS_MAX ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            onChange([...buttons, { action: "route", target: "profile", labels: {} }])
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Ajouter un bouton
        </Button>
      ) : (
        <p className="text-xs text-zinc-500">{BROADCAST_BUTTONS_MAX} boutons au plus.</p>
      )}
    </div>
  );
}
