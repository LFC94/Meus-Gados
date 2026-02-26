import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

export type IconMapping =
  | ComponentProps<typeof MaterialIcons>["name"]
  | ComponentProps<typeof MaterialCommunityIcons>["name"];

export type IconSymbolProps = {
  name: IconMapping;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  library?: "material" | "community";
};

type MaterialIconsName = ComponentProps<typeof MaterialIcons>["name"];
type MaterialCommunityIconsName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function isMaterialIcon(name: IconMapping): name is MaterialIconsName {
  return (MaterialIcons as { glyphMap?: Record<string, unknown> }).glyphMap?.[name] !== undefined;
}

/**
 * An icon component that uses Material Icons or Material Community Icons.
 */
export function IconSymbol({ name, size = 24, color, style, library = "material" }: IconSymbolProps) {
  if (library === "community" || !isMaterialIcon(name)) {
    return <MaterialCommunityIcons color={color} size={size} name={name as MaterialCommunityIconsName} style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={name} style={style} />;
}
