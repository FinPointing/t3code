import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { useMemo } from "react";

import { useAppearancePreferences } from "../features/settings/appearance/AppearancePreferencesProvider";
import { useUniwindTheme } from "./useUniwindTheme";

export function useMobileNavigationTheme(surface: "screen" | "sidebar" = "screen"): Theme {
  const { themeAppearance: appearance, fonts } = useAppearancePreferences();
  const variables = useUniwindTheme();
  return useMemo(() => {
    const base = appearance === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      fonts: {
        regular: { ...base.fonts.regular, fontFamily: fonts.interface.regular },
        medium: { ...base.fonts.medium, fontFamily: fonts.interface.medium },
        bold: { ...base.fonts.bold, fontFamily: fonts.interface.bold },
        heavy: { ...base.fonts.heavy, fontFamily: fonts.interface.bold },
      },
      colors: {
        ...base.colors,
        primary: variables["--color-primary-text"],
        background: variables[surface === "sidebar" ? "--color-drawer" : "--color-screen"],
        card: variables[surface === "sidebar" ? "--color-drawer" : "--color-sheet-solid"],
        text: variables[
          surface === "sidebar" ? "--color-drawer-foreground" : "--color-header-foreground"
        ],
        border:
          variables[surface === "sidebar" ? "--color-drawer-border" : "--color-header-border"],
        notification: variables["--color-danger-foreground"],
      },
    };
  }, [appearance, surface, variables, fonts.interface]);
}
