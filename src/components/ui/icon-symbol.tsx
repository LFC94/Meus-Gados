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

/**
 * An icon component that uses Material Icons or Material Community Icons.
 */
export function IconSymbol({ name, size = 24, color, style, library = "material" }: IconSymbolProps) {
  const isMaterial = name in (MaterialIcons as any).glyphMap;
  if (library === "community" || !isMaterial) {
    return <MaterialCommunityIcons color={color} size={size} name={name as any} style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={name as any} style={style} />;
}
