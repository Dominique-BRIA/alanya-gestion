"use client";

import type { RichTextMarker } from "@/lib/rich-text-parser";

/**
 * Même barre que le chat d'Alanya Work (web et mobile) : même ordre, mêmes
 * marqueurs, mêmes glyphes — gras B, italique I, barré S, souligné U,
 * manuscrit Aa.
 */
const FORMATS: { marker: RichTextMarker; label: string; glyph: string; className: string }[] = [
  { marker: "*", label: "Gras (*texte*)", glyph: "B", className: "font-bold" },
  { marker: "_", label: "Italique (_texte_)", glyph: "I", className: "italic font-serif" },
  { marker: "~", label: "Barré (~texte~)", glyph: "S", className: "line-through" },
  { marker: "__", label: "Souligné (__texte__)", glyph: "U", className: "underline" },
  { marker: "`", label: "Manuscrit (`texte`)", glyph: "Aa", className: "font-handwriting text-base" },
];

interface RichTextToolbarProps {
  onFormat: (marker: RichTextMarker) => void;
  disabled?: boolean;
  emojiSlot?: React.ReactNode;
}

export function RichTextToolbar({ onFormat, disabled, emojiSlot }: RichTextToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-1">
      {FORMATS.map(({ marker, label, glyph, className }) => (
        <button
          key={marker}
          type="button"
          title={label}
          aria-label={label}
          disabled={disabled}
          // Garder la sélection du champ : sans cela, le clic la fait perdre.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormat(marker)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          <span className={className}>{glyph}</span>
        </button>
      ))}
      {emojiSlot ? <div className="ml-auto">{emojiSlot}</div> : null}
    </div>
  );
}
