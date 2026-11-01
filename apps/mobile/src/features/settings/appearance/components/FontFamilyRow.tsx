import { useState } from "react";
import { Pressable } from "react-native";

import { Menu } from "../../../../components/ui/Menu";
import { ListRowLayout } from "../../../../components/ui/ListRowLayout";
import { SymbolView } from "../../../../components/ui/AppSymbol";
import { getGoogleFont, type GoogleFontId } from "../../../../lib/googleFonts";
import { GoogleFontPickerSheet } from "./GoogleFontPickerSheet";

export function FontFamilyRow<T extends string | null>(props: {
  readonly label: string;
  readonly value: T;
  readonly options: ReadonlyArray<{ readonly id: T; readonly title: string }>;
  readonly disabled: boolean;
  readonly onChange: (value: T) => void;
  readonly googleFontsMonospaceOnly?: boolean;
  readonly onGoogleFontChange?: (value: GoogleFontId) => void;
}) {
  const [googleFontsOpen, setGoogleFontsOpen] = useState(false);
  const selected = props.options.find((option) => option.id === props.value);
  const selectedGoogleFont = getGoogleFont(props.value);
  const actions = props.options.map((option, index) => ({
    id: String(index),
    title: option.title,
    state: option.id === props.value ? ("on" as const) : ("off" as const),
    attributes: { disabled: props.disabled },
  }));
  if (props.onGoogleFontChange) {
    actions.push({
      id: "google-fonts",
      title: "Google Fonts…",
      state: selectedGoogleFont ? "on" : "off",
      attributes: { disabled: props.disabled },
    });
  }
  return (
    <>
      <Menu
        actions={actions}
        onPressAction={({ nativeEvent }) => {
          if (props.disabled) return;
          if (nativeEvent.event === "google-fonts") {
            setGoogleFontsOpen(true);
            return;
          }
          const option = props.options[Number(nativeEvent.event)];
          if (!props.disabled && option) props.onChange(option.id);
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${props.label}, ${selectedGoogleFont?.family ?? selected?.title ?? "Default"}`}
          accessibilityState={{ disabled: props.disabled }}
          disabled={props.disabled}
          className="bg-grouped-card active:opacity-70"
        >
          <ListRowLayout
            label={props.label}
            detail={selectedGoogleFont?.family ?? selected?.title}
            disabled={props.disabled}
            accessory={
              <SymbolView name="chevron.down" size={14} tintColorClassName="accent-chevron" />
            }
          />
        </Pressable>
      </Menu>
      {props.onGoogleFontChange && googleFontsOpen ? (
        <GoogleFontPickerSheet
          monospaceOnly={props.googleFontsMonospaceOnly ?? false}
          onClose={() => setGoogleFontsOpen(false)}
          onSelect={props.onGoogleFontChange}
          selectedFontId={getGoogleFont(props.value) ? (props.value as GoogleFontId) : undefined}
        />
      ) : null}
    </>
  );
}
