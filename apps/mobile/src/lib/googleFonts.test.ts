import { describe, expect, it } from "vite-plus/test";
import {
  googleFontId,
  getGoogleFont,
  googleFontAlias,
  googleFontCssUrl,
  googleFontDownloadUrl,
  searchGoogleFonts,
} from "./googleFonts";
import { resolveMobileFonts } from "./appearanceFonts";

describe("Google Fonts selection", () => {
  it("searches family words without case sensitivity and limits code choices to monospace", () => {
    expect(searchGoogleFonts("  MONO roboto ", true).map((font) => font.family)).toEqual([
      "Roboto Mono",
    ]);
    expect(searchGoogleFonts("Inter", false).some((font) => font.family === "Inter")).toBe(true);
    expect(searchGoogleFonts("Inter", true)).toEqual([]);
    expect(searchGoogleFonts("", true).every((font) => font.category === "Monospace")).toBe(true);
    expect(searchGoogleFonts("no-such-family", false)).toEqual([]);
    expect(getGoogleFont("google:unknown")).toBeUndefined();
  });

  it("keeps requested choices while falling back until their native fonts are loaded", () => {
    const mono = googleFontId("Roboto Mono");
    const text = googleFontId("Lora");
    const stored = { interfaceFontFamily: text, codeFontFamily: mono, terminalFontFamily: mono };
    const waiting = resolveMobileFonts(stored, "android", 16);
    expect(waiting.interfaceFontId).toBe(text);
    expect(waiting.interface.regular).toBe("Inter-Regular");
    expect(waiting.code).toBe("monospace");
    const ready = resolveMobileFonts(stored, "android", 16, new Set([text, mono]));
    expect(ready.interface.regular).toBe(googleFontAlias(text));
    expect(ready.prompt).toEqual(ready.interface);
    expect(ready.code).toBe(googleFontAlias(mono));
    expect(ready.terminal).toBe(googleFontAlias(mono));
    expect(
      resolveMobileFonts(
        { codeFontFamily: text, terminalFontFamily: text },
        "android",
        16,
        new Set([text]),
      ),
    ).toMatchObject({
      codeFontId: "system",
      terminalFontId: null,
      code: "monospace",
      terminal: "MesloLGS NF",
    });
  });

  it("requests native font data and rejects unsupported web files and foreign hosts", () => {
    const font = getGoogleFont(googleFontId("Roboto Mono"))!;
    expect(new URL(googleFontCssUrl(font)).searchParams.get("family")).toBe("Roboto Mono:wght@400");
    expect(
      googleFontDownloadUrl(
        "@font-face { src: url(https://fonts.gstatic.com/s/robotomono/v31/font.ttf) format('truetype'); }",
      ),
    ).toBe("https://fonts.gstatic.com/s/robotomono/v31/font.ttf");
    for (const source of [
      "http://fonts.gstatic.com/font.ttf",
      "https://other.example/font.ttf",
      "https://fonts.gstatic.com/font.woff2",
    ]) {
      expect(() => googleFontDownloadUrl("src: url(" + source + ")")).toThrow(
        "supported font file",
      );
    }
  });
});
