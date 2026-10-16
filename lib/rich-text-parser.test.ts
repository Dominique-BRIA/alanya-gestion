import { describe, expect, it } from "vitest";
import { applyFormat, parseRichSpans, stripMarkers } from "./rich-text-parser";

// Convention d'Alanya Work (web + mobile) : *gras* _italique_ ~barré~ __souligné__ `manuscrit`
describe("mise en forme Alanya Work", () => {
  it("reconnaît les cinq marqueurs", () => {
    const s = parseRichSpans("*a* _b_ ~c~ __d__ `e`").filter((x) => x.text.trim());
    expect(s.map((x) => x.text)).toEqual(["a", "b", "c", "d", "e"]);
    expect(s[0]!.bold).toBe(true);
    expect(s[1]!.italic).toBe(true);
    expect(s[2]!.strike).toBe(true);
    expect(s[3]!.underline).toBe(true);
    expect(s[3]!.italic).toBeFalsy();
    expect(s[4]!.handwriting).toBe(true);
  });

  it("ne traite plus = ni # comme des marqueurs", () => {
    expect(stripMarkers("=a= #b#")).toBe("=a= #b#");
  });

  it("retire les marqueurs pour l'aperçu brut", () => {
    expect(stripMarkers("*gras* et __souligné__")).toBe("gras et souligné");
  });

  it("un second clic retire la mise en forme", () => {
    const une = applyFormat("bonjour", "__", 0, 7);
    expect(une.next).toBe("__bonjour__");
    const deux = applyFormat(une.next, "__", une.selectionStart, une.cursor);
    expect(deux.next).toBe("bonjour");
  });

  it("garde les liens cliquables", () => {
    const s = parseRichSpans("voir https://alanyavox.com.");
    expect(s.find((x) => x.link)?.link).toBe("https://alanyavox.com");
  });
});
