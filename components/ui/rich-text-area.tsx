"use client";

import { useRef, type RefObject } from "react";
import { applyFormat, type RichTextMarker } from "@/lib/rich-text-parser";
import { insertAtCursor } from "@/lib/insert-at-cursor";
import { RichTextToolbar } from "./rich-text-toolbar";

interface RichTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean; 
  emojiPicker?: (insert: (text: string) => void) => React.ReactNode;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  className?: string;
}

export function RichTextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
  disabled,
  emojiPicker,
  textareaRef: externalRef,
  className = "",
}: RichTextAreaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

  // `selectionStart` : la plage mise en forme reste sélectionnée, comme sur
  // le mobile et le web — un second clic la remet à l'état brut.
  function applySelection(update: { next: string; cursor: number; selectionStart?: number }) {
    onChange(update.next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(update.selectionStart ?? update.cursor, update.cursor);
    });
  }

  function handleFormat(marker: RichTextMarker) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    applySelection(applyFormat(value, marker, start, end));
  }

  function insertAtSelection(text: string) {
    const el = ref.current;
    if (!el) {
      onChange(value + text);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    applySelection(insertAtCursor(value, text, start, end));
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <RichTextToolbar
        onFormat={handleFormat}
        disabled={disabled}
        emojiSlot={emojiPicker?.(insertAtSelection)}
      />
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      /> 
    </div>
  );
}