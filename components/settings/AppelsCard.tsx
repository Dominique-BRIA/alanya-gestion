"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useCallSettings, useUpdateCallSettings } from "@/hooks/useCallSettings";
import type { RelaisPrincipal } from "@/types";
import { AlertTriangle, Clock, Loader2, PhoneCall } from "lucide-react";

/**
 * Les réglages des appels (07/11/2026) : quels relais TURN passent en premier.
 *
 * Les deux relais restent toujours dans la liste donnée aux téléphones : le
 * principal porte l'appel quand il répond, l'autre prend le relais sinon.
 */
const OPTIONS: { valeur: RelaisPrincipal; titre: string; detail: (nosRelais: string) => string }[] = [
  {
    valeur: "cloudflare",
    titre: "Cloudflare principal",
    detail: (nosRelais) => `Le TURN de Cloudflare d'abord. Secours : ${nosRelais}.`,
  },
  {
    valeur: "nos_relais",
    titre: "Nos relais principaux",
    detail: (nosRelais) => `${nosRelais} d'abord. Secours : Cloudflare.`,
  },
];

export function AppelsCard({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = useCallSettings();
  const update = useUpdateCallSettings();
  const { addToast } = useToast();

  const nosRelais = data?.nosRelais?.length ? data.nosRelais.join(", ") : "nos relais";

  function choisir(valeur: RelaisPrincipal) {
    if (!data || valeur === data.relaisPrincipal) return;
    update.mutate(valeur, {
      onSuccess: () =>
        addToast({
          title: valeur === "cloudflare" ? "Cloudflare devient le relais principal" : "Nos relais deviennent principaux",
          description: "Effet sur les appels suivants, sous 10 secondes.",
          variant: "success",
        }),
      onError: () => addToast({ title: "Échec", description: "Action réservée au super-admin", variant: "error" }),
    });
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base">Appels</CardTitle>
        </div>
        <CardDescription>Relais utilisés quand deux téléphones ne peuvent pas se joindre en direct</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-red-600 dark:text-red-400">Réglage indisponible : l&apos;état n&apos;a pas pu être chargé.</p>
        ) : (
          <>
            <div role="radiogroup" aria-label="Relais principal" className="grid gap-2">
              {OPTIONS.map((o) => {
                const actif = data.relaisPrincipal === o.valeur;
                return (
                  <button
                    key={o.valeur}
                    type="button"
                    role="radio"
                    aria-checked={actif}
                    onClick={() => choisir(o.valeur)}
                    disabled={!canEdit || update.isPending}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                      actif
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    } ${!canEdit ? "opacity-70" : ""}`}
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
                      <span className="block text-xs text-zinc-500">{o.detail(nosRelais)}</span>
                    </span>
                    {update.isPending && update.variables === o.valeur && (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin text-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {!data.cloudflareConfigure && (
              <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Cloudflare n&apos;est pas configuré sur le serveur : seuls nos relais portent les appels, quel que soit ce choix.
              </p>
            )}

            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Vaut pour les appels suivants ; ceux en cours gardent leurs relais.
              {data.modifiePar ? ` Dernière modification : ${data.modifiePar}.` : ""}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
