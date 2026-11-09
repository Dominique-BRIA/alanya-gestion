"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useCallSettings, useUpdateCallSettings } from "@/hooks/useCallSettings";
import type { MoteurGroupes, RelaisPrincipal } from "@/types";
import { AlertTriangle, Clock, Loader2, PhoneCall } from "lucide-react";

/**
 * Les réglages des appels (07/11/2026) :
 *  - quels relais TURN passent en premier (les deux restent toujours proposés
 *    aux téléphones : le principal porte l'appel quand il répond, l'autre
 *    prend le relais sinon) ;
 *  - le moteur des appels de groupe et des réunions : P2P Meeting (mesh) ou
 *    SFU Meeting. Le tête-à-tête reste toujours en direct.
 *
 * Libellés demandés le 09/11/2026 : le nom du fournisseur ne s'affiche pas.
 * P2P Alanya = nos relais ; P2P Cloud = le relais `cloudflare`.
 */

type Option<T> = { valeur: T; titre: string; detail: string };

function Choix<T extends string>({
  libelle,
  options,
  actuel,
  enCours,
  desactive,
  indisponible,
  onChoisir,
}: {
  libelle: string;
  options: Option<T>[];
  actuel: T;
  enCours: T | null;
  desactive: boolean;
  indisponible?: (v: T) => boolean;
  onChoisir: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={libelle} className="grid gap-2">
      {options.map((o) => {
        const actif = actuel === o.valeur;
        const horsService = !actif && (indisponible?.(o.valeur) ?? false);
        return (
          <button
            key={o.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChoisir(o.valeur)}
            disabled={desactive || horsService}
            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed ${
              actif
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            } ${desactive || horsService ? "opacity-60" : ""}`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                actif ? "border-indigo-600" : "border-zinc-400"
              }`}
            >
              {actif && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">{o.titre}</span>
              <span className="block text-xs text-zinc-500">{o.detail}</span>
            </span>
            {enCours === o.valeur && <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin text-indigo-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function AppelsCard({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = useCallSettings();
  const update = useUpdateCallSettings();
  const { addToast } = useToast();
  const [confirmerSfu, setConfirmerSfu] = useState(false);

  const nosRelais = data?.nosRelais?.length ? data.nosRelais.join(", ") : "nos relais";
  const relaisEnCours = update.isPending ? update.variables?.relaisPrincipal ?? null : null;
  const moteurEnCours = update.isPending ? update.variables?.moteurGroupes ?? null : null;

  function choisirRelais(valeur: RelaisPrincipal) {
    if (!data || valeur === data.relaisPrincipal) return;
    update.mutate(
      { relaisPrincipal: valeur },
      {
        onSuccess: () =>
          addToast({
            title: valeur === "cloudflare" ? "P2P Cloud devient le relais principal" : "P2P Alanya devient le relais principal",
            description: "Effet sur les appels suivants, sous 10 secondes.",
            variant: "success",
          }),
        onError: () => addToast({ title: "Échec", description: "Action réservée au super-admin", variant: "error" }),
      },
    );
  }

  function appliquerMoteur(valeur: MoteurGroupes) {
    update.mutate(
      { moteurGroupes: valeur },
      {
        onSuccess: () =>
          addToast({
            title: valeur === "sfu" ? "Groupes et réunions : SFU Meeting" : "Groupes et réunions : P2P Meeting",
            description: "Effet sur les appels et réunions qui commencent, sous 10 secondes.",
            variant: "success",
          }),
        onError: () =>
          addToast({
            title: "Échec",
            description: valeur === "sfu" ? "SFU Meeting n'est pas configuré sur le serveur, ou action réservée au super-admin" : "Action réservée au super-admin",
            variant: "error",
          }),
        onSettled: () => setConfirmerSfu(false),
      },
    );
  }

  /** Passer au SFU touche tous les groupes : on confirme. Revenir en arrière, non. */
  function choisirMoteur(valeur: MoteurGroupes) {
    if (!data || valeur === data.moteurGroupes) return;
    if (valeur === "sfu") setConfirmerSfu(true);
    else appliquerMoteur("mesh");
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base">Appels</CardTitle>
        </div>
        <CardDescription>Relais et moteur des appels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-red-600 dark:text-red-400">Réglage indisponible : l&apos;état n&apos;a pas pu être chargé.</p>
        ) : (
          <>
            <section className="space-y-2">
              <div>
                <p className="text-sm font-medium">Relais principal</p>
                <p className="text-xs text-zinc-500">Utilisé quand deux appareils ne peuvent pas se joindre en direct.</p>
              </div>
              <Choix<RelaisPrincipal>
                libelle="Relais principal"
                actuel={data.relaisPrincipal}
                enCours={relaisEnCours}
                desactive={!canEdit || update.isPending}
                onChoisir={choisirRelais}
                options={[
                  { valeur: "nos_relais", titre: "P2P Alanya", detail: `Nos relais d'abord (${nosRelais}). Secours : P2P Cloud.` },
                  { valeur: "cloudflare", titre: "P2P Cloud", detail: "Le relais cloud d'abord. Secours : P2P Alanya." },
                ]}
              />
              {!data.cloudflareConfigure && (
                <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  P2P Cloud n&apos;est pas configuré sur le serveur : seul P2P Alanya porte les appels, quel que soit ce choix.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <div>
                <p className="text-sm font-medium">Appels de groupe et réunions</p>
                <p className="text-xs text-zinc-500">Le tête-à-tête reste toujours en direct.</p>
              </div>
              <Choix<MoteurGroupes>
                libelle="Moteur des appels de groupe et des réunions"
                actuel={data.moteurGroupes}
                enCours={moteurEnCours}
                desactive={!canEdit || update.isPending}
                indisponible={(v) => v === "sfu" && !data.sfuConfigure}
                onChoisir={choisirMoteur}
                options={[
                  { valeur: "mesh", titre: "P2P Meeting", detail: "Chaque participant se connecte à chacun des autres." },
                  { valeur: "sfu", titre: "SFU Meeting", detail: "Une seule connexion par participant, vers un serveur qui redistribue." },
                ]}
              />
              {!data.sfuConfigure ? (
                <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  SFU Meeting n&apos;est pas encore configuré sur le serveur.
                </p>
              ) : (
                <p className="text-xs text-zinc-500">
                  Un groupe ou une réunion ne passe en SFU Meeting que si tous ses participants ont la dernière version d&apos;Alanya Work ; sinon, il reste en P2P Meeting.
                </p>
              )}
            </section>

            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Vaut pour les appels qui commencent ; ceux en cours ne changent pas.
              {data.modifiePar ? ` Dernière modification : ${data.modifiePar}.` : ""}
            </p>
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmerSfu}
        onOpenChange={setConfirmerSfu}
        title="Passer les groupes et les réunions en SFU Meeting ?"
        description="Les appels de groupe et les réunions qui commencent passeront en SFU Meeting, quand tous leurs participants ont la dernière version de l'application. Ceux en cours ne changent pas. Vous pourrez revenir en P2P Meeting à tout moment."
        confirmLabel="Passer en SFU Meeting"
        pending={update.isPending}
        onConfirm={() => appliquerMoteur("sfu")}
      />
    </Card>
  );
}
