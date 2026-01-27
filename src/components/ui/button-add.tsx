import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/use-colors";

import { IconMapping, IconSymbol } from "./icon-symbol";

interface ButtonAddProps {
  label: string;
  onPress?: () => void;
  icon?: IconMapping;
  color?: string;
}

export function ButtonAdd({ label, onPress, icon, color }: ButtonAddProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  color = color ? color : colors.primary;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 999,
        marginBottom: insets.bottom,
        height: 60,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        className="flex-row rounded-2xl p-4 items-center justify-center"
        style={{
          backgroundColor: color,
          width: 300,
          shadowColor: colors.foreground,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
          elevation: 4,
        }}
      >
        {icon && <IconSymbol name={icon} color="white" />}
        <Text className="text-white font-bold text-lg">{label}</Text>
      </TouchableOpacity>
    </View>
  );
}
