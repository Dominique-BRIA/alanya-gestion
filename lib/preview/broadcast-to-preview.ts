import { WELCOME_CTA_MSG_TYPE, type PreviewLang, type PreviewMessage } from "@/components/preview/types";
import type { BroadcastButton } from "@/types";
import { statutMediaType } from "@/lib/broadcast-payload";
import type { Translations } from "@/lib/content-locales";
import { resolveLocalized } from "./localized";

export interface BroadcastPreviewInput {
  /** 0 = message privé, 1 = statut 24 h. */
  kind: number;
  translations: Translations;
  /** Type média du message (0 texte · 1 image · 2 vidéo · 3 audio · 4 fichier). */
  type: number;
  mediaUrl?: string | null;
  /** Statut texte uniquement — `#RRGGBB` ; vide = indigo de marque. */
  backgroundColor?: string | null;
  /** Boutons sous le message (`kind = 0` seulement). */
  buttons?: BroadcastButton[];
}

export type BroadcastPreviewResult =
  | { mode: "chat"; messages: PreviewMessage[] }
  | {
      mode: "status";
      text: string;
      type: number;
      mediaUrl: string | null;
      backgroundColor: string | null;
    };

/**
 * Dérive l'aperçu d'une diffusion telle qu'elle sera réellement livrée.
 *
 * - `kind = 0` → un message unique dans la conversation officielle, matérialisé
 *   à la volée par `materializeForUser` (broadcastService.js:461).
 * - `kind = 1` → aucun message : une ligne `statut` est créée à la publication
 *   (broadcastService.js:125-136), et son type média est déduit de l'URL.
 */
export function broadcastToPreview(
  input: BroadcastPreviewInput,
  lang: PreviewLang,
): BroadcastPreviewResult {
  const text = resolveLocalized(input.translations, lang);
  const mediaUrl = input.mediaUrl?.trim() || null;

  if (input.kind === 1) {
    return {
      mode: "status",
      text,
      type: statutMediaType(mediaUrl),
      mediaUrl,
      // Un statut média recouvre le fond : la couleur ne s'applique qu'au texte.
      backgroundColor: mediaUrl ? null : input.backgroundColor?.trim() || null,
    };
  }

  const messages: PreviewMessage[] = [{ type: input.type, content: text || null, mediaUrl }];
  // Les boutons arrivent en message à part, juste après — le même rendu que
  // le bloc « Boutons » de la bienvenue. Un bouton sans libellé dans cette
  // langue (ni dans le repli) ou sans cible n'est pas envoyé.
  const buttons = (input.buttons ?? [])
    .map((b) => ({ label: resolveLocalized(b.labels, lang), action: b.action, target: b.target.trim() }))
    .filter((b) => b.label && b.target);
  if (buttons.length) {
    messages.push({ type: WELCOME_CTA_MSG_TYPE, content: JSON.stringify({ buttons }), mediaUrl: null });
  }
  return { mode: "chat", messages };
}

/** Longueur du corps de la notification push (broadcastService.js:356-364). */
export const PUSH_BODY_MAX = 120;

/** Corps par défaut quand le contenu est vide — `defaultBroadcastPushBody`. */
export function defaultPushBody(kind: number, lang: PreviewLang): string {
  const isStatus = Number(kind) === 1;
  switch (lang) {
    case "en":
      return isStatus ? "New status" : "New announcement";
    case "zh":
      return isStatus ? "\u65b0\u52a8\u6001" : "\u65b0\u516c\u544a";
    default:
      return isStatus ? "Nouveau statut" : "Nouvelle annonce";
  }
}
