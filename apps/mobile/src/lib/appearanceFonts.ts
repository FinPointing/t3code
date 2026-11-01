import { FONT_FAMILIES } from "./fontFamilies";

export const MOBILE_TEXT_FONT_IDS = [
  "dm-sans",
  "system",
  "serif",
  "condensed",
  "monospace",
] as const;
type MobileTextFontId = (typeof MOBILE_TEXT_FONT_IDS)[number];
export const MOBILE_MONO_FONT_IDS = ["system", "meslo"] as const;
type MobileMonoFontId = (typeof MOBILE_MONO_FONT_IDS)[number];

export interface MobileFontPreferences {
  readonly interfaceFontFamily?: MobileTextFontId;
  readonly promptFontFamily?: MobileTextFontId | null;
  readonly codeFontFamily?: MobileMonoFontId;
  readonly terminalFontFamily?: MobileMonoFontId | null;
  readonly promptFontSize?: number | null;
}

export const MOBILE_TEXT_FONT_LABELS: Record<MobileTextFontId, string> = {
  "dm-sans": "DM Sans",
  system: "System sans",
  serif: "System serif",
  condensed: "Condensed sans",
  monospace: "System monospace",
};
export const MOBILE_MONO_FONT_LABELS: Record<MobileMonoFontId, string> = {
  system: "System monospace",
  meslo: "Meslo Nerd Font",
};

export function isMobileTextFontId(value: unknown): value is MobileTextFontId {
  return MOBILE_TEXT_FONT_IDS.some((id) => id === value);
}

export function isMobileMonoFontId(value: unknown): value is MobileMonoFontId {
  return MOBILE_MONO_FONT_IDS.some((id) => id === value);
}

function resolveTextFontFamily(id: MobileTextFontId, platform: string) {
  switch (id) {
    case "dm-sans":
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

function resolveMonoFontFamily(id: MobileMonoFontId, platform: string): string {
  return id === "meslo" ? "MesloLGS NF" : platform === "ios" ? "Menlo" : "monospace";
}

export function resolveMobileFonts(
  stored: MobileFontPreferences | null,
  platform: string,
  baseFontSize: number,
) {
  const interfaceFontId = isMobileTextFontId(stored?.interfaceFontFamily)
    ? stored.interfaceFontFamily
    : "dm-sans";
  const promptFontId = isMobileTextFontId(stored?.promptFontFamily)
    ? stored.promptFontFamily
    : null;
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
    interface: resolveTextFontFamily(interfaceFontId, platform),
    prompt: resolveTextFontFamily(promptFontId ?? interfaceFontId, platform),
    code: resolveMonoFontFamily(codeFontId, platform),
    terminal: resolveMonoFontFamily(terminalFontId ?? "meslo", platform),
    promptFontSize: customPromptFontSize ?? baseFontSize,
    isPromptFontSizeCustom: customPromptFontSize !== null,
  };
}

export type ResolvedMobileFonts = ReturnType<typeof resolveMobileFonts>;
