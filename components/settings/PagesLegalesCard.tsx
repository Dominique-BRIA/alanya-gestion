"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { usePagesLegales, useUpdatePageLegale } from "@/hooks/useLegal";
import type { PageLegale } from "@/lib/api/legal";
import { ExternalLink, FileText, Loader2, Save } from "lucide-react";

/**
 * LES PAGES LÉGALES (18/11/2026, publication sur le Play Store).
 *
 * La politique de confidentialité et les conditions d'utilisation, publiques
 * sur alanyavox.com et ouvertes depuis l'application. Chaque enregistrement
 * crée une nouvelle version, datée et notée au journal d'audit.
 *
 * Le texte est du Markdown simple : `## Titre`, `- élément de liste`,
 * `**gras**`, et une ligne vide entre deux paragraphes.
 */
const ADRESSES: Record<PageLegale["slug"], string> = {
  confidentialite: "https://alanyavox.com/confidentialite",
  conditions: "https://alanyavox.com/conditions",
};

function Editeur({ page, canEdit }: { page: PageLegale; canEdit: boolean }) {
  const { addToast: toast } = useToast();
  const maj = useUpdatePageLegale();
  const [titre, setTitre] = useState(page.titre);
  const [contenu, setContenu] = useState(page.contenu);
  const [confirmer, setConfirmer] = useState(false);
  useEffect(() => {
    setTitre(page.titre);
    setContenu(page.contenu);
  }, [page.titre, page.contenu, page.version]);
  const modifie = titre !== page.titre || contenu !== page.contenu;
  const aCompleter = (contenu.match(/\[[^\]]+\]/g) ?? []).length;

  const enregistrer = () =>
    maj.mutate(
      { slug: page.slug, titre: titre.trim(), contenu: contenu.trim() },
      {
        onSuccess: (p) => toast({ title: "Enregistré", description: `Version ${p.version} publiée.`, variant: "success" }),
        onError: (e: unknown) =>
          toast({
            title: "Échec de l'enregistrement",
            description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Réessayez.",
            variant: "error",
          }),
      },
    );

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {page.parDefaut ? "Version d'origine (jamais modifiée)" : `Version ${page.version}`}
        </span>
        {page.majLe && <span>· mise à jour le {new Date(page.majLe).toLocaleString("fr-FR")}</span>}
        <a href={ADRESSES[page.slug]} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-indigo-600 hover:underline">
          Voir la page publique <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {aCompleter > 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {aCompleter} mention{aCompleter > 1 ? "s" : ""} entre crochets à compléter (éditeur, contact, durées…).
        </p>
      )}
      <div className="space-y-1">
        <Label htmlFor={`titre-${page.slug}`}>Titre</Label>
        <Input id={`titre-${page.slug}`} value={titre} disabled={!canEdit} onChange={(e) => setTitre(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`contenu-${page.slug}`}>Texte (Markdown simple)</Label>
        <Textarea
          id={`contenu-${page.slug}`}
          value={contenu}
          disabled={!canEdit}
          onChange={(e) => setContenu(e.target.value)}
          className="min-h-[360px] font-mono text-xs leading-relaxed"
        />
      </div>
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={() => setConfirmer(true)} disabled={!modifie || maj.isPending}>
            {maj.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publier une nouvelle version
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirmer}
        onOpenChange={setConfirmer}
        title="Publier cette version ?"
        description="Elle remplace aussitôt la page publique, sur le web et dans l'application."
        confirmLabel="Publier"
        onConfirm={() => {
          setConfirmer(false);
          enregistrer();
        }}
      />
    </div>
  );
}

export function PagesLegalesCard({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = usePagesLegales();
  const [actif, setActif] = useState<PageLegale["slug"]>("confidentialite");
  const page = data?.find((p) => p.slug === actif);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Pages légales
        </CardTitle>
        <CardDescription>
          Politique de confidentialité et conditions d'utilisation, publiques sur alanyavox.com et ouvertes depuis
          l'application. Exigées par le Play Store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {(["confidentialite", "conditions"] as const).map((s) => (
            <Button key={s} variant={actif === s ? "default" : "outline"} size="sm" onClick={() => setActif(s)}>
              {s === "confidentialite" ? "Confidentialité" : "Conditions d'utilisation"}
            </Button>
          ))}
        </div>
        {isLoading && <Skeleton className="h-[420px] w-full" />}
        {isError && <p className="text-sm text-red-600">Impossible de charger les pages légales.</p>}
        {page && <Editeur key={page.slug} page={page} canEdit={canEdit} />}
      </CardContent>
    </Card>
  );
}
