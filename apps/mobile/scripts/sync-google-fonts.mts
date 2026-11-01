// @effect-diagnostics nodeBuiltinImport:off - Maintainer script refreshes the bundled public font catalog.
import * as NodeFSP from "node:fs/promises";

const response = await fetch("https://fonts.google.com/metadata/fonts");
if (!response.ok) throw new Error("Could not download the Google Fonts catalog.");
const body = await response.text();
const metadata: unknown = JSON.parse(body.slice(body.indexOf("{")));
if (
  typeof metadata !== "object" ||
  metadata === null ||
  !("familyMetadataList" in metadata) ||
  !Array.isArray(metadata.familyMetadataList)
) {
  throw new Error("Unexpected Google Fonts catalog format.");
}
const families = metadata.familyMetadataList.flatMap((entry: unknown) => {
  if (
    typeof entry !== "object" ||
    entry === null ||
    !("family" in entry) ||
    typeof entry.family !== "string" ||
    !("category" in entry) ||
    typeof entry.category !== "string" ||
    !("fonts" in entry) ||
    typeof entry.fonts !== "object" ||
    entry.fonts === null
  )
    return [];
  const weights = Object.keys(entry.fonts)
    .filter((weight) => /^\d+$/.test(weight))
    .map(Number);
  if (weights.length === 0) return [];
  weights.sort((left, right) => Math.abs(left - 400) - Math.abs(right - 400) || left - right);
  return [{ family: entry.family, category: entry.category, weight: weights[0] }];
});
if (families.length < 1000)
  throw new Error("The catalog looks incomplete; keeping the existing snapshot.");
families.sort((left, right) =>
  left.family.toLowerCase().localeCompare(right.family.toLowerCase(), "en"),
);
await NodeFSP.writeFile(
  new URL("../src/lib/googleFontsCatalog.json", import.meta.url),
  JSON.stringify(families, null, 2) + "\n",
);
process.stdout.write("Updated " + families.length + " Google Fonts families.\n");
