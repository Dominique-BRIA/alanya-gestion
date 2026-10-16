/**
 * Mise en forme du texte — la CONVENTION D'ALANYA WORK, pas celle d'origine.
 *
 * Tout vient de `lib/mise-en-forme.ts`, copie exacte du client web
 * (STAGE-WEB `src/lib/mise-en-forme.ts`), lui-même miroir du mobile :
 *
 *   *gras*   _italique_   ~barré~   __souligné__   `manuscrit`
 *
 * La console d'origine utilisait `=souligné=` et `#manuscrit#` : un message
 * officiel écrit ainsi arrivait avec ses `=` et ses `#` dans l'application.
 * Ce fichier ne garde que l'interface attendue par les composants
 * (`parseRichSpans`, `stripMarkers`, `applyFormat`).
 */
import { analyseMiseEnForme, appliquerMarqueur, sansMarqueurs, type NoeudTexte, type StyleTexte } from "@/lib/mise-en-forme";

export type RichTextMarker = "*" | "_" | "~" | "__" | "`";

export interface RichTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  handwriting?: boolean;
  link?: string;
}

type Style = Omit<RichTextSegment, "text">;

const STYLE: Record<StyleTexte, keyof Style> = {
  gras: "bold",
  italique: "italic",
  barre: "strike",
  souligne: "underline",
  manuscrit: "handwriting",
};

const URL_REGEXP = /((?:https?:\/\/|www\.)[^\s]+)/gi;

function trimUrlTail(url: string): string {
  const tail = ".,;:!?)]}'\"";
  let end = url.length;
  while (end > 0 && tail.includes(url[end - 1]!)) end--;
  return url.slice(0, end);
}

function appendWithLinks(out: RichTextSegment[], text: string, style: Style) {
  let last = 0;
  const re = new RegExp(URL_REGEXP.source, URL_REGEXP.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) out.push({ text: text.slice(last, match.index), ...style });
    const raw = match[0]!;
    const url = trimUrlTail(raw);
    out.push({ text: url, ...style, link: url });
    if (url.length < raw.length) out.push({ text: raw.slice(url.length), ...style });
    last = match.index + raw.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), ...style });
}

function aplatir(noeuds: NoeudTexte[], style: Style, out: RichTextSegment[]) {
  for (const n of noeuds) {
    if ("texte" in n) appendWithLinks(out, n.texte, style);
    else aplatir(n.enfants, { ...style, [STYLE[n.style]]: true }, out);
  }
}

/** Découpe le texte en segments stylés (gras, italique, liens…). */
export function parseRichSpans(text: string): RichTextSegment[] {
  if (!text) return [];
  const out: RichTextSegment[] = [];
  aplatir(analyseMiseEnForme(text), {}, out);
  return out;
}

/** Le texte sans ses marqueurs, pour les aperçus en texte brut. */
export function stripMarkers(text: string): string {
  return sansMarqueurs(text);
}

/**
 * Applique — ou RETIRE — un marqueur autour de la sélection, comme le mobile
 * et le web (`appliquerMarqueur`) : un second clic ôte la mise en forme au lieu
 * d'empiler `**gras**`. Rend aussi la sélection à rétablir.
 */
export function applyFormat(
  text: string,
  marker: RichTextMarker,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number; selectionStart: number } {
  const r = appliquerMarqueur(text, selectionStart, selectionEnd, marker);
  return { next: r.texte, cursor: r.fin, selectionStart: r.debut };
}
