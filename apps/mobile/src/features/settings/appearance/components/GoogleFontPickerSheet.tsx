import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View, type TextInputInstance } from "react-native";

import { AppText as Text } from "../../../../components/ui/AppText";
import { Button } from "../../../../components/ui/Button";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { ListRowLayout } from "../../../../components/ui/ListRowLayout";
import { SearchField } from "../../../../components/ui/SearchField";
import { Sheet } from "../../../../components/ui/Sheet";
import { downloadAndLoadGoogleFont, isGoogleFontLoaded } from "../../../../lib/googleFontDownloads";
import {
  googleFontAlias,
  googleFontId,
  searchGoogleFonts,
  type GoogleFontId,
} from "../../../../lib/googleFonts";

export function GoogleFontPickerSheet(props: {
  readonly monospaceOnly: boolean;
  readonly onClose: () => void;
  readonly onSelect: (id: GoogleFontId) => void;
  readonly selectedFontId?: GoogleFontId;
}) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<GoogleFontId | null>(null);
  const [failedId, setFailedId] = useState<GoogleFontId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInputInstance>(null);
  const fonts = useMemo(
    () => searchGoogleFonts(query, props.monospaceOnly),
    [query, props.monospaceOnly],
  );

  const mounted = useRef(true);
  const downloading = useRef(false);
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- prevents an in-flight font download from applying a choice after this sheet is dismissed
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const selectFont = async (id: GoogleFontId) => {
    if (downloading.current) return;
    downloading.current = true;
    setBusyId(id);
    setFailedId(null);
    setError(null);
    try {
      await downloadAndLoadGoogleFont(id);
    } catch (cause) {
      if (!mounted.current) return;
      downloading.current = false;
      setBusyId(null);
      setFailedId(id);
      setError(
        cause instanceof Error
          ? cause.message
          : "The font couldn't be downloaded. Please try again.",
      );
      return;
    }
    if (!mounted.current) return;
    downloading.current = false;
    setBusyId(null);
    props.onSelect(id);
    props.onClose();
  };

  return (
    <Sheet title="Google Fonts" onClose={props.onClose}>
      <View className="flex-1 px-4 pb-4 pt-3">
        <View className="shrink-0 flex-row">
          <SearchField
            autoFocus={false}
            inputRef={inputRef}
            accessibilityLabel="Search Google Fonts"
            clearAccessibilityLabel="Clear font search"
            placeholder={props.monospaceOnly ? "Search monospace fonts" : "Search fonts"}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <Text textRole="caption" className="py-2 text-foreground-muted">
          {props.monospaceOnly
            ? "Monospaced fonts keep code and terminal columns aligned."
            : "Fonts download when selected and stay available offline."}
        </Text>
        {busyId ? (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`Loading ${busyId.slice(7)}`}
            className="flex-row items-center gap-3 py-4"
          >
            <ActivityIndicator />
            <Text
              textRole="footnote"
              accessibilityLiveRegion="polite"
              className="text-foreground-muted"
            >
              Downloading {busyId.slice(7)}…
            </Text>
          </View>
        ) : null}
        {error ? (
          <View
            className="my-3 rounded-2xl border border-border bg-danger p-4"
            accessibilityLiveRegion="polite"
          >
            <Text textRole="footnote" className="text-danger-foreground">
              {error}
            </Text>
            {busyId === null && failedId ? (
              <Button label="Retry" tone="text" onPress={() => void selectFont(failedId)} />
            ) : null}
          </View>
        ) : null}
        {fonts.length === 0 ? (
          <EmptyState title="No fonts found" detail="Try another search." variant="plain" />
        ) : (
          <FlatList
            className="mt-2 flex-1"
            data={fonts}
            keyExtractor={(font) => font.family}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={16}
            maxToRenderPerBatch={24}
            windowSize={7}
            renderItem={({ item }) => {
              const id = googleFontId(item.family);
              const selected = id === props.selectedFontId;
              const loading = busyId === id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.family}, ${item.category}${selected ? ", selected" : ""}`}
                  accessibilityState={{ disabled: busyId !== null, selected, busy: loading }}
                  disabled={busyId !== null}
                  onPress={() => void selectFont(id)}
                  className="border-b border-border/50"
                >
                  <ListRowLayout
                    label={item.family}
                    detail={item.category}
                    accessory={
                      <Text
                        className="text-foreground-muted"
                        style={{
                          fontFamily: isGoogleFontLoaded(id) ? googleFontAlias(id) : undefined,
                        }}
                      >
                        Aa
                      </Text>
                    }
                  />
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Sheet>
  );
}
