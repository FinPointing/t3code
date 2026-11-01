import * as Font from "expo-font";
import * as FileSystem from "expo-file-system/legacy";
import {
  getGoogleFont,
  googleFontAlias,
  googleFontCssUrl,
  googleFontDownloadUrl,
  type GoogleFontId,
} from "./googleFonts";

const pending = new Map<GoogleFontId, Promise<void>>();

export function isGoogleFontLoaded(id: GoogleFontId): boolean {
  return Font.isLoaded(googleFontAlias(id));
}

async function installFont(id: GoogleFontId): Promise<void> {
  const font = getGoogleFont(id);
  if (!font || !FileSystem.documentDirectory) throw new Error("Font storage is unavailable.");
  const directory = FileSystem.documentDirectory + "google-fonts/";
  const destination = directory + encodeURIComponent(font.family) + ".ttf";
  const temporary = destination + ".download";
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const cached = await FileSystem.getInfoAsync(destination);
  if (!cached.exists || cached.size === 0) {
    try {
      const response = await fetch(googleFontCssUrl(font), {
        // A legacy user agent requests full TrueType files rather than web-only WOFF subsets.
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok)
        throw new Error("Google Fonts is unavailable. Try again when you're online.");
      const source = googleFontDownloadUrl(await response.text());
      const downloaded = await FileSystem.downloadAsync(source, temporary);
      if (downloaded.status !== 200) throw new Error("The font download failed. Please try again.");
      await FileSystem.moveAsync({ from: temporary, to: destination });
    } catch (error) {
      await FileSystem.deleteAsync(temporary, { idempotent: true });
      throw error;
    }
  }
  try {
    await Font.loadAsync({ [googleFontAlias(id)]: { uri: destination } });
  } catch (error) {
    await FileSystem.deleteAsync(destination, { idempotent: true });
    throw error;
  }
}

export function downloadAndLoadGoogleFont(id: GoogleFontId): Promise<void> {
  if (isGoogleFontLoaded(id)) return Promise.resolve();
  const current = pending.get(id);
  if (current) return current;
  const operation = installFont(id).finally(() => pending.delete(id));
  pending.set(id, operation);
  return operation;
}
