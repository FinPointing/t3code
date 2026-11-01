import { useEffect, useState } from "react";
import type { MobileFontPreferences } from "../../../lib/appearanceFonts";
import { isGoogleFontId, type GoogleFontId } from "../../../lib/googleFonts";
import { downloadAndLoadGoogleFont, isGoogleFontLoaded } from "../../../lib/googleFontDownloads";

export function useGoogleFontRuntime(preferences: MobileFontPreferences | null) {
  const [loadedIds, setLoadedIds] = useState<ReadonlySet<GoogleFontId>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const requested = [
    ...new Set(
      [
        preferences?.interfaceFontFamily,
        preferences?.promptFontFamily,
        preferences?.codeFontFamily,
        preferences?.terminalFontFamily,
      ].filter(isGoogleFontId),
    ),
  ].sort();
  const key = JSON.stringify(requested);

  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- restores selected downloaded fonts into the native font registry after app launch
  useEffect(() => {
    let cancelled = false;
    const ids: GoogleFontId[] = JSON.parse(key);
    void Promise.allSettled(ids.map(downloadAndLoadGoogleFont)).then((results) => {
      if (cancelled) return;
      setError(
        results.some((result) => result.status === "rejected")
          ? "A selected font couldn't be loaded. Built-in fonts are being used; choose it again in Google Fonts to retry."
          : null,
      );
      setLoadedIds(new Set(ids.filter(isGoogleFontLoaded)));
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    loadedIds,
    error,
  };
}
