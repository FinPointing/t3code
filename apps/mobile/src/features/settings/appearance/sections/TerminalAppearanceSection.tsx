import {
  MAX_TERMINAL_FONT_SIZE,
  MIN_TERMINAL_FONT_SIZE,
  TERMINAL_FONT_SIZE_STEP,
} from "../../../../lib/appearancePreferences";
import { SettingsSection } from "../../components/SettingsSection";
import { SettingsSwitchRow } from "../../components/SettingsSwitchRow";
import { useAppearancePreferences } from "../AppearancePreferencesProvider";
import {
  AppearancePreviewSeparator,
  TerminalAppearancePreview,
} from "../components/AppearancePreviews";
import { FontSizeSliderRow } from "../components/FontSizeSliderRow";
import { FontFamilyRow } from "../components/FontFamilyRow";
import { MOBILE_MONO_FONT_IDS, MOBILE_MONO_FONT_LABELS } from "../../../../lib/appearanceFonts";

export function TerminalAppearanceSection() {
  const { isReady, appearance, fonts, setFontPreferences, setTerminalFontSize } =
    useAppearancePreferences();
  const custom = appearance.isTerminalFontSizeCustom;

  const handleToggleCustom = (enabled: boolean) => {
    setTerminalFontSize(enabled ? appearance.terminalFontSize : null);
  };

  return (
    <SettingsSection title="Terminal">
      <TerminalAppearancePreview fontSize={appearance.terminalFontSize} />
      <AppearancePreviewSeparator />
      <FontFamilyRow
        label="Terminal font"
        value={fonts.terminalFontId}
        options={[
          { id: null, title: "Default (Meslo)" },
          ...MOBILE_MONO_FONT_IDS.map((id) => ({ id, title: MOBILE_MONO_FONT_LABELS[id] })),
        ]}
        disabled={!isReady}
        onChange={(terminalFontFamily) => setFontPreferences({ terminalFontFamily })}
        googleFontsMonospaceOnly
        onGoogleFontChange={(terminalFontFamily) => setFontPreferences({ terminalFontFamily })}
      />
      <SettingsSwitchRow
        disabled={!isReady}
        icon="terminal"
        label="Custom font size"
        onValueChange={handleToggleCustom}
        value={custom}
      />
      {custom ? (
        <FontSizeSliderRow
          disabled={!isReady}
          icon="textformat.size"
          label="Font size"
          max={MAX_TERMINAL_FONT_SIZE}
          min={MIN_TERMINAL_FONT_SIZE}
          onChange={setTerminalFontSize}
          step={TERMINAL_FONT_SIZE_STEP}
          value={appearance.terminalFontSize}
          valueLabel={`${appearance.terminalFontSize.toFixed(1)} pt`}
        />
      ) : null}
    </SettingsSection>
  );
}
