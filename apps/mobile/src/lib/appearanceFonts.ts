import { FONT_FAMILIES } from "./fontFamilies";
import { getGoogleFont, googleFontAlias, isGoogleFontId, type GoogleFontId } from "./googleFonts";

export const MOBILE_TEXT_FONT_IDS = ["inter", "system", "serif", "condensed", "monospace"] as const;
type MobileTextFontId = (typeof MOBILE_TEXT_FONT_IDS)[number] | GoogleFontId;
export const MOBILE_MONO_FONT_IDS = ["system", "meslo"] as const;
type MobileMonoFontId = (typeof MOBILE_MONO_FONT_IDS)[number] | GoogleFontId;

export interface MobileFontPreferences {
  readonly interfaceFontFamily?: MobileTextFontId;
  readonly promptFontFamily?: MobileTextFontId | null;
  readonly codeFontFamily?: MobileMonoFontId;
  readonly terminalFontFamily?: MobileMonoFontId | null;
  readonly promptFontSize?: number | null;
}

export const MOBILE_TEXT_FONT_LABELS = {
  inter: "Inter",
  system: "System sans",
  serif: "System serif",
  condensed: "Condensed sans",
  monospace: "System monospace",
};
export const MOBILE_MONO_FONT_LABELS = {
  system: "System monospace",
  meslo: "Meslo Nerd Font",
};

export function isMobileTextFontId(value: unknown): value is MobileTextFontId {
  return MOBILE_TEXT_FONT_IDS.some((id) => id === value) || isGoogleFontId(value);
}

export function normalizeStoredTextFontId(value: unknown): MobileTextFontId | undefined {
  return value === "dm-sans" ? "inter" : isMobileTextFontId(value) ? value : undefined;
}

export function isMobileMonoFontId(value: unknown): value is MobileMonoFontId {
  return (
    MOBILE_MONO_FONT_IDS.some((id) => id === value) ||
    getGoogleFont(value)?.category === "Monospace"
  );
}

function resolveTextFontFamily(
  id: MobileTextFontId,
  platform: string,
  loaded: ReadonlySet<GoogleFontId>,
) {
  if (isGoogleFontId(id)) {
    if (!loaded.has(id)) return FONT_FAMILIES;
    const regular = googleFontAlias(id);
    return { regular, medium: regular, bold: regular };
  }
  switch (id) {
    case "inter":
      return FONT_FAMILIES;
    case "system": {
      const regular = platform === "ios" ? "System" : "sans-serif";
      return { regular, medium: regular, bold: regular };
    }
    case "serif": {
      const regular = platform === "ios" ? "Georgia" : "serif";
      return { regular, medium: regular, bold: regular };
    }
    case "condensed": {
      const regular = platform === "ios" ? "AvenirNextCondensed-Regular" : "sans-serif-condensed";
      return { regular, medium: regular, bold: regular };
    }
    case "monospace": {
      const regular = platform === "ios" ? "Menlo" : "monospace";
      return { regular, medium: regular, bold: regular };
    }
  }
}

function resolveMonoFontFamily(
  id: MobileMonoFontId,
  platform: string,
  loaded: ReadonlySet<GoogleFontId>,
): string {
  if (isGoogleFontId(id) && loaded.has(id)) return googleFontAlias(id);
  return id === "meslo" ? "MesloLGS NF" : platform === "ios" ? "Menlo" : "monospace";
}

export function resolveMobileFonts(
  stored: MobileFontPreferences | null,
  platform: string,
  baseFontSize: number,
  loadedGoogleFonts: ReadonlySet<GoogleFontId> = new Set(),
) {
  const interfaceFontId = normalizeStoredTextFontId(stored?.interfaceFontFamily) ?? "inter";
  const promptFontId = normalizeStoredTextFontId(stored?.promptFontFamily) ?? null;
  const codeFontId = isMobileMonoFontId(stored?.codeFontFamily) ? stored.codeFontFamily : "system";
  const terminalFontId = isMobileMonoFontId(stored?.terminalFontFamily)
    ? stored.terminalFontFamily
    : null;
  const customPromptFontSize =
    typeof stored?.promptFontSize === "number" && Number.isFinite(stored.promptFontSize)
      ? Math.max(11, Math.min(22, Math.round(stored.promptFontSize)))
      : null;
  return {
    interfaceFontId,
    promptFontId,
    codeFontId,
    terminalFontId,
    interface: resolveTextFontFamily(interfaceFontId, platform, loadedGoogleFonts),
    prompt: resolveTextFontFamily(promptFontId ?? interfaceFontId, platform, loadedGoogleFonts),
    code: resolveMonoFontFamily(codeFontId, platform, loadedGoogleFonts),
    terminal: resolveMonoFontFamily(terminalFontId ?? "meslo", platform, loadedGoogleFonts),
    promptFontSize: customPromptFontSize ?? baseFontSize,
    isPromptFontSizeCustom: customPromptFontSize !== null,
  };
}

export type ResolvedMobileFonts = ReturnType<typeof resolveMobileFonts>;
