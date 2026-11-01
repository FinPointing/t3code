import { Pressable } from "react-native";

import { Menu } from "../../../../components/ui/Menu";
import { ListRowLayout } from "../../../../components/ui/ListRowLayout";
import { SymbolView } from "../../../../components/ui/AppSymbol";

export function FontFamilyRow<T extends string | null>(props: {
  readonly label: string;
  readonly value: T;
  readonly options: ReadonlyArray<{ readonly id: T; readonly title: string }>;
  readonly disabled: boolean;
  readonly onChange: (value: T) => void;
}) {
  const selected = props.options.find((option) => option.id === props.value);
  return (
    <Menu
      actions={props.options.map((option, index) => ({
        id: String(index),
        title: option.title,
        state: option.id === props.value ? "on" : "off",
        attributes: { disabled: props.disabled },
      }))}
      onPressAction={({ nativeEvent }) => {
        const option = props.options[Number(nativeEvent.event)];
        if (!props.disabled && option) props.onChange(option.id);
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${props.label}, ${selected?.title ?? "Default"}`}
        accessibilityState={{ disabled: props.disabled }}
        disabled={props.disabled}
        className="bg-grouped-card active:opacity-70"
      >
        <ListRowLayout
          label={props.label}
          detail={selected?.title}
          disabled={props.disabled}
          accessory={
            <SymbolView name="chevron.down" size={14} tintColorClassName="accent-chevron" />
          }
        />
      </Pressable>
    </Menu>
  );
}
