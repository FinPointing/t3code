import { describe, expect, it } from "vite-plus/test";
import { resolveMobileFonts } from "./appearanceFonts";

describe("resolveMobileFonts", () => {
  it("follows interface font and text size until prompt overrides are stored", () => {
    const defaults = resolveMobileFonts({}, "android", 17);
    expect(defaults.promptFontId).toBeNull();
    expect(defaults.prompt).toEqual(defaults.interface);
    expect(defaults.promptFontSize).toBe(17);
    expect(defaults.terminal).toBe("MesloLGS NF");
    expect(
      resolveMobileFonts({ promptFontFamily: "serif", promptFontSize: 19 }, "android", 17),
    ).toMatchObject({
      promptFontId: "serif",
      promptFontSize: 19,
      isPromptFontSizeCustom: true,
    });
  });

  it("normalizes invalid stored font IDs and clamps prompt size", () => {
    expect(
      resolveMobileFonts(
        {
          interfaceFontFamily: "invalid" as never,
          codeFontFamily: "invalid" as never,
          promptFontSize: 100,
        },
        "android",
        16,
      ),
    ).toMatchObject({
      interfaceFontId: "inter",
      codeFontId: "system",
      promptFontSize: 22,
    });
  });
});
