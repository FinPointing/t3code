import {
  CODE_FONT_SIZE_STEP,
  MAX_CODE_FONT_SIZE,
  MIN_CODE_FONT_SIZE,
} from "../../../../lib/appearancePreferences";
import { SettingsSection } from "../../components/SettingsSection";
import { SettingsSwitchRow } from "../../components/SettingsSwitchRow";
import { useAppearancePreferences } from "../AppearancePreferencesProvider";
import {
  AppearancePreviewSeparator,
  CodeAppearancePreview,
} from "../components/AppearancePreviews";
import { FontSizeSliderRow } from "../components/FontSizeSliderRow";
import { FontFamilyRow } from "../components/FontFamilyRow";
import { MOBILE_MONO_FONT_IDS, MOBILE_MONO_FONT_LABELS } from "../../../../lib/appearanceFonts";

export function CodeAppearanceSection() {
  const { isReady, appearance, fonts, setFontPreferences, setCodeFontSize, setCodeWordBreak } =
    useAppearancePreferences();
  const custom = appearance.isCodeFontSizeCustom;

  const handleToggleCustom = (enabled: boolean) => {
    setCodeFontSize(enabled ? appearance.codeFontSize : null);
  };

  return (
    <SettingsSection title="Code & Diffs">
      <CodeAppearancePreview
        fontSize={appearance.codeFontSize}
        wordBreak={appearance.codeWordBreak}
      />
      <AppearancePreviewSeparator />
      <FontFamilyRow
        label="Code font"
        value={fonts.codeFontId}
        options={MOBILE_MONO_FONT_IDS.map((id) => ({ id, title: MOBILE_MONO_FONT_LABELS[id] }))}
        disabled={!isReady}
        onChange={(codeFontFamily) => setFontPreferences({ codeFontFamily })}
        googleFontsMonospaceOnly
        onGoogleFontChange={(codeFontFamily) => setFontPreferences({ codeFontFamily })}
      />
      <SettingsSwitchRow
        disabled={!isReady}
        icon="chevron.left.forwardslash.chevron.right"
        label="Custom font size"
        onValueChange={handleToggleCustom}
        value={custom}
      />
      {custom ? (
        <FontSizeSliderRow
          disabled={!isReady}
          icon="textformat.size"
          label="Font size"
          max={MAX_CODE_FONT_SIZE}
          min={MIN_CODE_FONT_SIZE}
          onChange={setCodeFontSize}
          step={CODE_FONT_SIZE_STEP}
          value={appearance.codeFontSize}
          valueLabel={`${appearance.codeFontSize} pt`}
        />
      ) : null}
      <SettingsSwitchRow
        disabled={!isReady}
        icon="text.word.spacing"
        label="Word break"
        onValueChange={setCodeWordBreak}
        value={appearance.codeWordBreak}
      />
    </SettingsSection>
  );
}
