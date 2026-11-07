"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useDeveloperSettings, useUpdateDeveloperSettings } from "@/hooks/useDeveloperSettings";
import { Code2, Loader2, Save } from "lucide-react";

/**
 * L'espace développeur (07/11/2026) : combien d'enseignes une personne peut
 * créer depuis alanyavox.com/developer.
 *
 * Une enseigne est un compte à part (son nom, son numéro Alanya) au nom duquel
 * l'API envoie les messages ; ses clés lui sont rattachées. 0 ferme la
 * création, sans toucher aux enseignes existantes. La gestion complète des
 * comptes développeur viendra plus tard dans cette console.
 */
export function DeveloppeurCard({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = useDeveloperSettings();
  const update = useUpdateDeveloperSettings();
  const { addToast } = useToast();
  const [valeur, setValeur] = useState("");

  useEffect(() => {
    if (data) setValeur(String(data.enseignesParPersonne));
  }, [data]);

  const nombre = Number(valeur);
  const valide = valeur.trim() !== "" && Number.isInteger(nombre) && nombre >= 0 && nombre <= (data?.maximum ?? 100);
  const modifie = !!data && valide && nombre !== data.enseignesParPersonne;

  function enregistrer() {
    if (!modifie) return;
    update.mutate(nombre, {
      onSuccess: () =>
        addToast({
          title: nombre === 0 ? "Création d'enseignes fermée" : `${nombre} enseigne${nombre > 1 ? "s" : ""} par personne`,
          description: "Effet immédiat sur les créations suivantes.",
          variant: "success",
        }),
      onError: () => addToast({ title: "Échec", description: "Action réservée au super-admin", variant: "error" }),
    });
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base">Espace développeur</CardTitle>
        </div>
        <CardDescription>Enseignes que chaque personne peut créer pour utiliser l&apos;API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : isError || !data ? (
          <p className="text-sm text-red-600 dark:text-red-400">Réglage indisponible : l&apos;état n&apos;a pas pu être chargé.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="enseignesParPersonne">Nombre d&apos;enseignes par personne</Label>
              <div className="flex gap-2">
                <Input
                  id="enseignesParPersonne"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={data.maximum}
                  step={1}
                  value={valeur}
                  onChange={(e) => setValeur(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enregistrer()}
                  disabled={!canEdit || update.isPending}
                  className="w-28"
                />
                <Button
                  onClick={enregistrer}
                  disabled={!canEdit || !modifie || update.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="ml-2">Enregistrer</span>
                </Button>
              </div>
              {!valide && <p className="text-xs text-red-600">Un nombre entier entre 0 et {data.maximum}.</p>}
              <p className="text-xs text-zinc-500">
                0 ferme la création de nouvelles enseignes ; celles qui existent continuent de fonctionner.
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
                <dt className="text-xs text-zinc-500">Enseignes</dt>
                <dd className="text-lg font-semibold">{data.enseignes}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
                <dt className="text-xs text-zinc-500">Personnes</dt>
                <dd className="text-lg font-semibold">{data.personnes}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
                <dt className="text-xs text-zinc-500">À la limite</dt>
                <dd className="text-lg font-semibold">{data.personnesALaLimite}</dd>
              </div>
            </dl>

            {data.modifiePar && (
              <p className="text-xs text-zinc-500">Dernière modification : {data.modifiePar}.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
