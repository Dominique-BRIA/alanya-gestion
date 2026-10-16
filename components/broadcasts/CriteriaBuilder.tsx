"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountries } from "@/hooks/useCountries";
import { useEntreprises } from "@/hooks/useBroadcasts";
import { TYPE_COMPTE_LABELS, TYPES_COMPTE_CIBLABLES } from "@/lib/type-compte";
import type { BroadcastCriteria, BroadcastCriteriaField, BroadcastCriteriaOp } from "@/types";
import { Plus, Trash2 } from "lucide-react";

/**
 * Le ciblage d'une diffusion, avec les champs que NOTRE base connaît :
 * pays, entreprise, type de compte, inscription, dernière activité.
 * (Genre, âge et ville n'existent pas chez nous — voir
 * `backend-alanya/src/lib/gestion/diffusions.ts`.)
 */
export interface DraftCondition {
  id: string;
  field: BroadcastCriteriaField;
  op: BroadcastCriteriaOp;
  value: string;
  /** Pour les dates : un décalage (« -30 ») en jours, ou une date absolue. */
  mode?: "relatif" | "date";
}

/** Plafond serveur (`MAX_CONDITIONS` de diffusions.ts). */
export const MAX_CONDITIONS = 20;

const FIELDS: { value: BroadcastCriteriaField; label: string }[] = [
  { value: "idPays", label: "Pays" },
  { value: "idCompany", label: "Entreprise" },
  { value: "type_compte", label: "Type de compte" },
  { value: "created_at", label: "Inscription" },
  { value: "last_seen", label: "Dernière activité" },
];

const DATE_FIELDS: BroadcastCriteriaField[] = ["created_at", "last_seen"];

function newDraft(): DraftCondition {
  return { id: crypto.randomUUID(), field: "idPays", op: "eq", value: "" };
}

function isComplete(d: DraftCondition): boolean {
  if (DATE_FIELDS.includes(d.field) && (d.mode ?? "relatif") === "relatif") {
    return /^\d+$/.test(d.value.trim());
  }
  return d.value.trim() !== "";
}

export function draftToCriteria(drafts: DraftCondition[]): BroadcastCriteria {
  const conditions = drafts.filter(isComplete).map((d) => {
    if (DATE_FIELDS.includes(d.field)) {
      const op: BroadcastCriteriaOp = d.op === "before" ? "before" : "after";
      // « il y a N jours » : un décalage NÉGATIF, que le serveur gèle à l'envoi.
      const value =
        (d.mode ?? "relatif") === "relatif"
          ? { relative: `-${Number(d.value)} days` }
          : { absolute: new Date(`${d.value}T00:00:00`).toISOString() };
      return { field: d.field, op, value };
    }
    return { field: d.field, op: "eq" as const, value: Number(d.value) };
  });
  return { v: 1, op: "and", conditions };
}

/** Messages bloquants — ce que le serveur refuserait. */
export function criteriaErrors(drafts: DraftCondition[]): string[] {
  return drafts.filter(isComplete).length > MAX_CONDITIONS ? [`Maximum ${MAX_CONDITIONS} conditions.`] : [];
}

interface CriteriaBuilderProps {
  drafts: DraftCondition[];
  onChange: (drafts: DraftCondition[]) => void;
}

export function CriteriaBuilder({ drafts, onChange }: CriteriaBuilderProps) {
  const { data: countries } = useCountries();
  const { data: entreprises } = useEntreprises();

  function update(id: string, patch: Partial<DraftCondition>) {
    onChange(drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  return (
    <div className="space-y-3">
      {drafts.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Aucun critère — tous les comptes actifs (hors compte officiel).
        </p>
      )}
      {drafts.map((d) => (
        <ConditionRow
          key={d.id}
          draft={d}
          countries={countries}
          entreprises={entreprises}
          onUpdate={(p) => update(d.id, p)}
          onRemove={() => onChange(drafts.filter((x) => x.id !== d.id))}
        />
      ))}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={drafts.length >= MAX_CONDITIONS}
          onClick={() => onChange([...drafts, newDraft()])}
        >
          <Plus className="mr-1 h-4 w-4" /> Ajouter une condition
        </Button>
        {drafts.length > 1 && (
          <span className="text-xs text-zinc-400">Toutes les conditions doivent être vraies (ET)</span>
        )}
      </div>
    </div>
  );
}

const selectClass =
  "h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function ConditionRow({
  draft,
  countries,
  entreprises,
  onUpdate,
  onRemove,
}: {
  draft: DraftCondition;
  countries?: { idPays: number; libelle: string }[];
  entreprises?: { idCompany: number; libelle: string; comptes: number }[];
  onUpdate: (p: Partial<DraftCondition>) => void;
  onRemove: () => void;
}) {
  const estDate = DATE_FIELDS.includes(draft.field);
  const mode = draft.mode ?? "relatif";
  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-zinc-100 p-2 dark:border-zinc-800">
      <select
        className={selectClass}
        aria-label="Critère"
        value={draft.field}
        onChange={(e) => {
          const field = e.target.value as BroadcastCriteriaField;
          onUpdate({ field, value: "", mode: "relatif", op: DATE_FIELDS.includes(field) ? "before" : "eq" });
        }}
      >
        {FIELDS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {draft.field === "idPays" && (
        <select className={`${selectClass} min-w-[160px]`} aria-label="Pays" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })}>
          <option value="">—</option>
          {countries?.map((c) => (
            <option key={c.idPays} value={c.idPays}>
              {c.libelle}
            </option>
          ))}
        </select>
      )}

      {draft.field === "idCompany" && (
        <select className={`${selectClass} min-w-[200px]`} aria-label="Entreprise" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })}>
          <option value="">—</option>
          {entreprises?.map((e) => (
            <option key={e.idCompany} value={e.idCompany}>
              {e.libelle} ({e.comptes})
            </option>
          ))}
        </select>
      )}

      {draft.field === "type_compte" && (
        <select className={`${selectClass} min-w-[180px]`} aria-label="Type de compte" value={draft.value} onChange={(e) => onUpdate({ value: e.target.value })}>
          <option value="">—</option>
          {TYPES_COMPTE_CIBLABLES.map((t) => (
            <option key={t} value={t}>
              {TYPE_COMPTE_LABELS[t]}
            </option>
          ))}
        </select>
      )}

      {estDate && (
        <>
          <select
            className={selectClass}
            aria-label="Opérateur"
            value={draft.op}
            onChange={(e) => onUpdate({ op: e.target.value as BroadcastCriteriaOp })}
          >
            <option value="before">avant</option>
            <option value="after">après</option>
          </select>
          <select
            className={selectClass}
            aria-label="Forme de la date"
            value={mode}
            onChange={(e) => onUpdate({ mode: e.target.value as "relatif" | "date", value: "" })}
          >
            <option value="relatif">il y a… jours</option>
            <option value="date">une date</option>
          </select>
          {mode === "relatif" ? (
            <>
              <Input
                className="h-9 w-24"
                type="number"
                min={0}
                aria-label="Nombre de jours"
                value={draft.value}
                onChange={(e) => onUpdate({ value: e.target.value })}
              />
              <span className="self-center text-xs text-zinc-400">jours (ex. « avant il y a 30 jours » = inactifs depuis 30 jours)</span>
            </>
          ) : (
            <Input
              className="h-9 w-40"
              type="date"
              aria-label="Date"
              value={draft.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />
          )}
        </>
      )}

      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Retirer la condition" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-zinc-400" />
      </Button>
    </div>
  );
}
