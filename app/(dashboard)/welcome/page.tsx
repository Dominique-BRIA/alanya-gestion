"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useOfficialAccount } from "@/hooks/useBroadcasts";
import {
  useWelcomeConfig,
  useSaveWelcomeDraft,
  usePublishWelcome,
  useBackfillWelcome,
  useWelcomeStatus,
} from "@/hooks/useWelcome";
import { WelcomeEditor } from "@/components/welcome/WelcomeEditor";
import { WelcomeStatusEditor } from "@/components/welcome/WelcomeStatusEditor";
import { WelcomePageSkeleton } from "@/components/skeletons";
import { TabPanel, Tabs, TabStatePill } from "@/components/ui/tabs";
import {
  REQUIRED_LOCALE_NAMES,
  untranslatedRequiredLocales,
} from "@/lib/content-locales";
import type { WelcomeBlock } from "@/types";
import { HandHeart, Loader2, Lock, MessageSquare, Radio, Rocket, Save, Undo2, Users } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  // `permsLoading` est indispensable ici : sans lui, la redirection ci-dessous
  // partirait pendant le chargement du profil, quand `can` répond encore faux.
  const { can, isLoading: permsLoading } = usePermissions();
  const isSuper = permsLoading || can("welcome.read");
  const { data, isLoading } = useWelcomeConfig();
  const { data: official } = useOfficialAccount();
  // Même clé de cache que dans l'éditeur : react-query ne requête qu'une fois.
  // Sert ici uniquement à afficher l'état sur l'onglet, sans avoir à y entrer.
  const { data: status } = useWelcomeStatus();
  const saveMutation = useSaveWelcomeDraft();
  const publishMutation = usePublishWelcome();
  const backfillMutation = useBackfillWelcome();
  const { addToast } = useToast();

  const [tab, setTab] = useState<"message" | "statut">("message");
  const [blocks, setBlocks] = useState<WelcomeBlock[]>([]);
  const [dirty, setDirty] = useState(false);

  /**
   * Blocs auxquels il manque une langue requise — numérotés comme dans l'éditeur.
   *
   * La règle est « traduire ce qui est écrit » : une légende vide dans toutes
   * les langues reste légitime sur un bloc image ou vidéo. Un bouton sans
   * libellé dans une langue est purement supprimé à la livraison, ce lecteur-là
   * verrait donc un bloc amputé — il compte donc aussi.
   *
   * Le contrôle porte sur `translations`, la forme que l'éditeur écrit : sur les
   * champs hérités `contentFr`/`contentEn`, un bloc ajouté depuis la migration
   * 053 arrivait vide et franchissait le garde sans traduction.
   */
  const untranslated = useMemo(
    () =>
      blocks
        .map((b, i) => {
          const textMissing =
            b.blockType !== "cta" &&
            untranslatedRequiredLocales(b.translations).length > 0;
          const ctaMissing =
            b.blockType === "cta" &&
            (b.ctaTranslations ?? []).some(
              (t) => untranslatedRequiredLocales(t).length > 0,
            );
          return textMissing || ctaMissing ? i + 1 : null;
        })
        .filter((n): n is number => n !== null),
    [blocks],
  );
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmBackfill, setConfirmBackfill] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (!isSuper && !isLoading) {
      router.replace("/dashboard");
    }
  }, [isSuper, isLoading, router]);

  useEffect(() => {
    if (data?.draft?.blocks) {
      setBlocks(data.draft.blocks);
      setDirty(false);
    }
  }, [data]);

  function handleSave() {
    saveMutation.mutate(blocks, {
      onSuccess: () => {
        setDirty(false);
        addToast({ title: "Brouillon enregistré", variant: "success" });
      },
      onError: () => addToast({ title: "Échec de l'enregistrement", variant: "error" }),
    });
  }

  /**
   * Rend l'éditeur au dernier brouillon enregistré.
   *
   * Même source que l'effet de chargement : le cache react-query, réécrit à
   * chaque enregistrement réussi. Un brouillon absent laisse une liste vide,
   * ce qui est bien l'état d'où l'on est parti.
   */
  function handleDiscard() {
    setBlocks(data?.draft?.blocks ?? []);
    setDirty(false);
    setConfirmDiscard(false);
  }

  function handlePublish() {
    if (untranslated.length) {
      setConfirmPublish(false);
      addToast({
        title: "Traduction manquante",
        description: `Bloc(s) ${untranslated.join(", ")} — complétez ${REQUIRED_LOCALE_NAMES} avant de publier.`,
        variant: "error",
      });
      return;
    }
    publishMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmPublish(false);
        addToast({ title: "Version publiée", variant: "success" });
      },
      onError: (e: Error) =>
        addToast({ title: "Échec", description: e.message, variant: "error" }),
    });
  }

  function handleBackfill() {
    backfillMutation.mutate(undefined, {
      onSuccess: (res) => {
        setConfirmBackfill(false);
        if (res.queued) {
          addToast({
            title: "Rattrapage lancé",
            description: `${res.pending.toLocaleString("fr-FR")} compte(s) à servir. Le compteur du bouton diminue au fil des lots — actualisez pour suivre.`,
            variant: "success",
          });
          return;
        }
        // Un rattrapage non mis en file n'est pas un succès : le dire.
        addToast({
          title:
            res.reason === "ALREADY_RUNNING"
              ? "Rattrapage déjà en cours"
              : "Rien à envoyer",
          description:
            res.reason === "ALREADY_RUNNING"
              ? "Un rattrapage est déjà en file d'attente. Attendez qu'il se termine."
              : "Tous les comptes éligibles ont déjà reçu le message.",
          variant: res.reason === "ALREADY_RUNNING" ? "error" : "success",
        });
      },
      onError: () => addToast({ title: "Échec du rattrapage", variant: "error" }),
    });
  }

  if (!isSuper && !isLoading) return null;

  const pending = data?.pendingBackfill ?? 0;
  const activeVersion = data?.active?.version ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <HandHeart className="h-7 w-7 text-indigo-600" />
          Accueil des nouveaux inscrits
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Ce que le compte officiel Alanya envoie à la fin de l&apos;onboarding
        </p>
      </div>

      {!isSuper && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Lock className="h-4 w-4" />
          Réservé au super-admin
        </div>
      )}

      {isLoading ? (
        <WelcomePageSkeleton />
      ) : (
        <>
          <Tabs
            idPrefix="welcome"
            aria-label="Sections de l'accueil"
            value={tab}
            onChange={setTab}
            items={[
              { value: "message" as const, label: "Message", icon: MessageSquare },
              {
                value: "statut" as const,
                label: "Statut 24 h",
                icon: Radio,
                badge: (
                  <TabStatePill
                    active={!!status?.enabled}
                    label={status?.enabled ? "Actif" : "Inactif"}
                  />
                ),
              },
            ]}
          />

          <TabPanel
            idPrefix="welcome"
            value="statut"
            active={tab === "statut"}
            className="pt-2"
          >
            <WelcomeStatusEditor
              senderName={official?.nom}
              senderAvatar={official?.avatarUrl}
            />
          </TabPanel>

          <TabPanel
            idPrefix="welcome"
            value="message"
            active={tab === "message"}
            className="space-y-6 pt-2"
          >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {activeVersion != null ? `Version active v${activeVersion}` : "Aucune version publiée"}
                    {dirty && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Modifications non enregistrées
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {data?.active?.publishedAt
                      ? `Publiée le ${new Date(data.active.publishedAt).toLocaleString("fr-FR")}`
                      : "Le brouillon ci-dessous n'a pas encore été publié."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={!dirty || saveMutation.isPending} variant="outline">
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-4 w-4" />
                  )}
                  Enregistrer brouillon
                </Button>
                {dirty && (
                  <Button
                    onClick={() => setConfirmDiscard(true)}
                    disabled={saveMutation.isPending}
                    variant="ghost"
                  >
                    <Undo2 className="mr-1 h-4 w-4" />
                    Annuler les modifications
                  </Button>
                )}
                <Button
                  onClick={() => setConfirmPublish(true)}
                  disabled={publishMutation.isPending || untranslated.length > 0}
                  title={
                    untranslated.length
                      ? `Traduction manquante — bloc(s) ${untranslated.join(", ")}`
                      : undefined
                  }
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Rocket className="mr-1 h-4 w-4" />
                  Publier
                </Button>
                {/* Le rattrapage n'apparaît que s'il a quelque chose à faire.
                    En régime normal la livraison se fait à l'onboarding et le
                    bouton reste invisible ; il ressurgit pour les comptes que
                    l'automatisme a manqués — échec réseau en fin d'inscription,
                    ou compte créé depuis l'admin qui n'ouvre jamais l'app. */}
                {pending > 0 && (
                  <Button
                    onClick={() => setConfirmBackfill(true)}
                    disabled={backfillMutation.isPending}
                    variant="secondary"
                  >
                    <Users className="mr-1 h-4 w-4" />
                    Rattrapage
                    <span className="ml-1.5 rounded-full bg-zinc-900/10 px-1.5 text-[11px] tabular-nums dark:bg-white/10">
                      {pending.toLocaleString("fr-FR")}
                    </span>
                  </Button>
                )}
              </div>

              {untranslated.length > 0 && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                  Traduction manquante — bloc(s){" "}
                  <strong>{untranslated.join(", ")}</strong>. {REQUIRED_LOCALE_NAMES} sont
                  obligatoires : sans traduction, le lecteur reçoit le texte d&apos;une
                  autre langue.
                </p>
              )}

              {pending > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  {pending.toLocaleString("fr-FR")} compte(s) n&apos;ont jamais reçu le message de bienvenue.
                </p>
              )}
              <p className="text-xs text-zinc-500">
                Publier ne renvoie rien aux comptes déjà servis : chaque utilisateur ne reçoit le
                message qu&apos;une seule fois, quelle que soit la version.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Éditeur</CardTitle>
              <CardDescription>
                Brouillon — chaque bloc devient un message distinct, dans cet ordre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WelcomeEditor
                blocks={blocks}
                senderName={official?.nom}
                senderAvatar={official?.avatarUrl}
                onChange={(next) => {
                  setBlocks(next);
                  setDirty(true);
                }}
              />
            </CardContent>
          </Card>
          </TabPanel>
        </>
      )}

      <ConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Publier cette version ?"
        description="Le brouillon devient la version active. Seuls les comptes qui n'ont jamais reçu le message de bienvenue le recevront — les utilisateurs déjà servis ne sont jamais renotifiés."
        confirmLabel="Publier"
        pending={publishMutation.isPending}
        onConfirm={handlePublish}
      >
        {dirty && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400">
            Vos modifications ne sont pas enregistrées : c&apos;est le dernier brouillon
            <strong> enregistré</strong> qui sera publié.
          </p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmBackfill}
        onOpenChange={setConfirmBackfill}
        title="Lancer le rattrapage ?"
        description={`Le message de bienvenue actif sera envoyé à ${pending.toLocaleString("fr-FR")} compte(s) existant(s) qui ne l'ont jamais reçu. L'envoi est étalé par lots.`}
        confirmLabel="Lancer"
        pending={backfillMutation.isPending}
        onConfirm={handleBackfill}
      />

      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Annuler les modifications ?"
        description="L'éditeur revient au dernier brouillon enregistré. Ce qui n'a pas été enregistré est perdu."
        confirmLabel="Annuler les modifications"
        cancelLabel="Continuer l'édition"
        variant="destructive"
        onConfirm={handleDiscard}
      />
    </div>
  );
}
