import catalog from "./googleFontsCatalog.json";

export type GoogleFontId = `google:${string}`;

export interface GoogleFontFamily {
  readonly family: string;
  readonly category: string;
  readonly weight: number;
}

const families: ReadonlyArray<GoogleFontFamily> = catalog;
const byFamily = new Map(families.map((font) => [font.family, font]));

export function googleFontId(family: string): GoogleFontId {
  if (!byFamily.has(family)) throw new Error("Unknown Google Fonts family.");
  return ("google:" + family) as GoogleFontId;
}

export function getGoogleFont(value: unknown): GoogleFontFamily | undefined {
  return typeof value === "string" && value.startsWith("google:")
    ? byFamily.get(value.slice(7))
    : undefined;
}

export function isGoogleFontId(value: unknown): value is GoogleFontId {
  return getGoogleFont(value) !== undefined;
}

export function googleFontAlias(id: GoogleFontId): string {
  return "T3Google_" + id.slice(7);
}

export function searchGoogleFonts(
  query: string,
  monospaceOnly: boolean,
): ReadonlyArray<GoogleFontFamily> {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return families.filter(
    (font) =>
      (!monospaceOnly || font.category === "Monospace") &&
      words.every((word) => font.family.toLocaleLowerCase().includes(word)),
  );
}

export function googleFontCssUrl(font: GoogleFontFamily): string {
  return (
    "https://fonts.googleapis.com/css2?family=" +
    encodeURIComponent(font.family + ":wght@" + font.weight) +
    "&display=swap"
  );
}

export function googleFontDownloadUrl(css: string): string {
  const match =
    /src:\s*url\(\s*['"]?(https:\/\/fonts\.gstatic\.com\/[^\s)'"]+\.ttf(?:\?[^\s)'"]*)?)['"]?\s*\)/.exec(
      css,
    );
  if (!match?.[1]) throw new Error("Google Fonts did not provide a supported font file.");
  return match[1];
}
