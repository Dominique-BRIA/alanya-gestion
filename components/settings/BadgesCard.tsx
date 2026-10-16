"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, RotateCcw, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useBadges, useUpdateBadges } from "@/hooks/useBadges";
import type { ApparenceBadge } from "@/lib/api/badges";

const NOMS: Record<string, string> = {
  officiel: "Compte officiel (Alanya Work)",
  verifie: "Entreprise vérifiée",
};

/**
 * Les badges à côté des noms. Le serveur décide qui en a un ; l'application et
 * le web dessinent l'image et le libellé réglés ici — un changement ne demande
 * aucune mise à jour du client (effet sous 30 secondes, au prochain
 * rafraîchissement de la liste).
 */
export function BadgesCard({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = useBadges();
  const update = useUpdateBadges();
  const { addToast } = useToast();
  const [form, setForm] = useState<Record<string, ApparenceBadge>>({});

  useEffect(() => {
    if (data) {
      setForm(Object.fromEntries(data.badges.map((b) => [b.type, { actif: b.actif, image: b.image, libelle: b.libelle }])));
    }
  }, [data]);

  const urlDe = (image: string) => (image.startsWith("/") ? `${data?.baseUrl ?? ""}${image}` : image);
  const modifie = (type: string, patch: Partial<ApparenceBadge>) =>
    setForm((f) => ({ ...f, [type]: { ...f[type]!, ...patch } }));

  function enregistrer() {
    update.mutate(form, {
      onSuccess: () => addToast({ title: "Badges enregistrés", description: "Visibles sous 30 secondes.", variant: "success" }),
      onError: (e: unknown) =>
        addToast({
          title: "Échec",
          description: (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Enregistrement impossible",
          variant: "error",
        }),
    });
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base">Badges</CardTitle>
        </div>
        <CardDescription>
          Affichés à côté du nom dans l&apos;application et sur le web, sans mise à jour du client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError || !data ? (
          <p className="text-sm text-red-600 dark:text-red-400">Réglage indisponible.</p>
        ) : (
          <>
            {data.badges.map((b) => {
              const f = form[b.type];
              if (!f) return null;
              return (
                <div key={b.type} className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={urlDe(f.image)} alt="" width={22} height={22} className="shrink-0" />
                      <p className="text-sm font-medium truncate">{NOMS[b.type] ?? b.type}</p>
                    </div>
                    <Switch
                      checked={f.actif}
                      disabled={!canEdit}
                      onCheckedChange={(v) => modifie(b.type, { actif: v })}
                      aria-label={`Afficher le badge ${NOMS[b.type] ?? b.type}`}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`badge-libelle-${b.type}`}>Libellé (info-bulle)</Label>
                      <Input
                        id={`badge-libelle-${b.type}`}
                        value={f.libelle}
                        maxLength={40}
                        disabled={!canEdit}
                        onChange={(e) => modifie(b.type, { libelle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`badge-image-${b.type}`}>Image (PNG ou SVG)</Label>
                      <div className="flex gap-1">
                        <Input
                          id={`badge-image-${b.type}`}
                          value={f.image}
                          disabled={!canEdit}
                          placeholder="/badges/… ou https://…"
                          onChange={(e) => modifie(b.type, { image: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Image par défaut"
                          disabled={!canEdit}
                          onClick={() => modifie(b.type, { image: b.defaut.image, libelle: b.defaut.libelle })}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              onClick={enregistrer}
              disabled={!canEdit || update.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {update.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Enregistrer
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
