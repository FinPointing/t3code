import {
  BASE_FONT_SIZE_STEP,
  MAX_BASE_FONT_SIZE,
  MIN_BASE_FONT_SIZE,
} from "../../../../lib/appearancePreferences";
import { SettingsSection } from "../../components/SettingsSection";
import { useAppearancePreferences } from "../AppearancePreferencesProvider";
import {
  AppearancePreviewSeparator,
  TextAppearancePreview,
  PromptAppearancePreview,
} from "../components/AppearancePreviews";
import { FontSizeSliderRow } from "../components/FontSizeSliderRow";
import { SettingsSwitchRow } from "../../components/SettingsSwitchRow";
import { FontFamilyRow } from "../components/FontFamilyRow";
import { MOBILE_TEXT_FONT_IDS, MOBILE_TEXT_FONT_LABELS } from "../../../../lib/appearanceFonts";

export function TextAppearanceSection() {
  const {
    isReady,
    appearance,
    fonts,
    setFontPreferences,
    setBaseFontSize,
    mathRenderingEnabled,
    setMathRenderingEnabled,
  } = useAppearancePreferences();

  return (
    <SettingsSection title="Text">
      <TextAppearancePreview fontSize={appearance.baseFontSize} />
      <AppearancePreviewSeparator />
      <FontFamilyRow
        label="Interface font"
        value={fonts.interfaceFontId}
        options={MOBILE_TEXT_FONT_IDS.map((id) => ({ id, title: MOBILE_TEXT_FONT_LABELS[id] }))}
        disabled={!isReady}
        onChange={(interfaceFontFamily) => setFontPreferences({ interfaceFontFamily })}
      />
      <FontSizeSliderRow
        disabled={!isReady}
        icon="textformat.size"
        label="Text size"
        max={MAX_BASE_FONT_SIZE}
        min={MIN_BASE_FONT_SIZE}
        onChange={setBaseFontSize}
        step={BASE_FONT_SIZE_STEP}
        value={appearance.baseFontSize}
        valueLabel={`${appearance.baseFontSize} pt`}
      />
      <AppearancePreviewSeparator />
      <FontFamilyRow
        label="Prompt font"
        value={fonts.promptFontId}
        options={[
          { id: null, title: "Follow interface" },
          ...MOBILE_TEXT_FONT_IDS.map((id) => ({ id, title: MOBILE_TEXT_FONT_LABELS[id] })),
        ]}
        disabled={!isReady}
        onChange={(promptFontFamily) => setFontPreferences({ promptFontFamily })}
      />
      <PromptAppearancePreview />
      <SettingsSwitchRow
        disabled={!isReady}
        icon="textformat.size"
        label="Custom prompt size"
        value={fonts.isPromptFontSizeCustom}
        onValueChange={(enabled) =>
          setFontPreferences({ promptFontSize: enabled ? fonts.promptFontSize : null })
        }
      />
      {fonts.isPromptFontSizeCustom ? (
        <FontSizeSliderRow
          disabled={!isReady}
          icon="textformat.size"
          label="Prompt size"
          min={MIN_BASE_FONT_SIZE}
          max={MAX_BASE_FONT_SIZE}
          step={BASE_FONT_SIZE_STEP}
          value={fonts.promptFontSize}
          valueLabel={`${fonts.promptFontSize} pt`}
          onChange={(value) => setFontPreferences({ promptFontSize: value })}
        />
      ) : null}
      <SettingsSwitchRow
        disabled={!isReady}
        icon="plusminus"
        label="Render math"
        value={mathRenderingEnabled}
        onValueChange={setMathRenderingEnabled}
      />
    </SettingsSection>
  );
}
