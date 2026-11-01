import { expect, it, vi } from "vite-plus/test";

const native = vi.hoisted(() => ({
  loaded: new Set<string>(),
  files: new Set<string>(),
  load: vi.fn(),
  fetch: vi.fn(),
  download: vi.fn(),
}));
vi.mock("expo-font", () => ({
  isLoaded: (family: string) => native.loaded.has(family),
  loadAsync: native.load,
}));
vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///documents/",
  makeDirectoryAsync: async () => {},
  getInfoAsync: async (uri: string) => ({
    exists: native.files.has(uri),
    size: native.files.has(uri) ? 100 : 0,
  }),
  downloadAsync: native.download,
  moveAsync: async ({ from, to }: { from: string; to: string }) => {
    native.files.delete(from);
    native.files.add(to);
  },
  deleteAsync: async (uri: string) => {
    native.files.delete(uri);
  },
}));
import { downloadAndLoadGoogleFont, isGoogleFontLoaded } from "./googleFontDownloads";
import { googleFontAlias, googleFontId } from "./googleFonts";

function setup() {
  native.loaded.clear();
  native.files.clear();
  native.fetch.mockReset();
  native.download.mockReset();
  native.load.mockReset();
  native.load.mockImplementation(async (sources: Record<string, unknown>) => {
    for (const family of Object.keys(sources)) native.loaded.add(family);
  });
  native.fetch.mockResolvedValue({
    ok: true,
    text: async () => "src: url(https://fonts.gstatic.com/s/font/v1/regular.ttf)",
  });
  native.download.mockImplementation(async (_source: string, destination: string) => {
    native.files.add(destination);
    return { status: 200 };
  });
  return { directory: "file:///documents/google-fonts/" };
}

it("restores a cached font offline without requesting Google", async () => {
  const { directory } = setup();
  const id = googleFontId("Fira Code");
  native.files.add(directory + "Fira%20Code.ttf");
  using _fetch = vi.spyOn(globalThis, "fetch").mockImplementation(native.fetch);
  await downloadAndLoadGoogleFont(id);
  expect(native.fetch).not.toHaveBeenCalled();
  expect(native.download).not.toHaveBeenCalled();
  expect(isGoogleFontLoaded(id)).toBe(true);
});

it("coalesces concurrent font requests so they cannot overwrite the same download", async () => {
  setup();
  const id = googleFontId("Roboto Mono");
  using _fetch = vi.spyOn(globalThis, "fetch").mockImplementation(native.fetch);
  const first = downloadAndLoadGoogleFont(id);
  const second = downloadAndLoadGoogleFont(id);
  expect(second).toBe(first);
  await Promise.all([first, second]);
  expect(native.download).toHaveBeenCalledTimes(1);
  expect(native.loaded.has(googleFontAlias(id))).toBe(true);
});

it("cleans a failed download and permits a later retry", async () => {
  const { directory } = setup();
  const id = googleFontId("JetBrains Mono");
  native.download.mockImplementationOnce(async (_source: string, destination: string) => {
    native.files.add(destination);
    return { status: 503 };
  });
  using _fetch = vi.spyOn(globalThis, "fetch").mockImplementation(native.fetch);
  await expect(downloadAndLoadGoogleFont(id)).rejects.toThrow("download failed");
  expect([...native.files]).toEqual([]);
  expect(isGoogleFontLoaded(id)).toBe(false);
  await downloadAndLoadGoogleFont(id);
  expect(native.files.has(directory + "JetBrains%20Mono.ttf")).toBe(true);
  expect(isGoogleFontLoaded(id)).toBe(true);
});

it("removes corrupt cached files so choosing the font again repairs them", async () => {
  const { directory } = setup();
  const id = googleFontId("Lora");
  const destination = directory + "Lora.ttf";
  native.files.add(destination);
  native.load.mockRejectedValueOnce(new Error("Invalid font data"));
  using _fetch = vi.spyOn(globalThis, "fetch").mockImplementation(native.fetch);
  await expect(downloadAndLoadGoogleFont(id)).rejects.toThrow("Invalid font");
  expect(native.files.has(destination)).toBe(false);
  await downloadAndLoadGoogleFont(id);
  expect(native.download).toHaveBeenCalledTimes(1);
  expect(isGoogleFontLoaded(id)).toBe(true);
});
