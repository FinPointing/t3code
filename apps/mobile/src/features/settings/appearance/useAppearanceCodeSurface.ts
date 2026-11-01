import { useMemo } from "react";

import {
  resolveMobileCodeSurface,
  type ResolvedMobileCodeSurface,
} from "../../../lib/appearancePreferences";
import { createNativeReviewDiffStyle } from "../../review/nativeReviewDiffAdapter";
import { createNativeSourceStyle } from "../../files/nativeSourceFileAdapter";
import { useAppearancePreferences } from "./AppearancePreferencesProvider";

export function useAppearanceCodeSurface(): {
  readonly codeSurface: ResolvedMobileCodeSurface;
  readonly codeFontFamily: string;
  readonly codeWordBreak: boolean;
  readonly nativeSourceStyle: ReturnType<typeof createNativeSourceStyle>;
  readonly nativeReviewDiffStyle: ReturnType<typeof createNativeReviewDiffStyle>;
} {
  const { appearance, fonts } = useAppearancePreferences();
  const codeSurface = useMemo(
    () => resolveMobileCodeSurface(appearance.codeFontSize),
    [appearance.codeFontSize],
  );
  const nativeSourceStyle = useMemo(
    () => createNativeSourceStyle(codeSurface, fonts.code),
    [codeSurface, fonts.code],
  );
  const nativeReviewDiffStyle = useMemo(
    () => createNativeReviewDiffStyle(codeSurface, appearance.codeWordBreak, fonts.code),
    [appearance.codeWordBreak, codeSurface, fonts.code],
  );

  return {
    codeSurface,
    codeFontFamily: fonts.code,
    codeWordBreak: appearance.codeWordBreak,
    nativeSourceStyle,
    nativeReviewDiffStyle,
  };
}
