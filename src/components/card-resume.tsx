import { Text, TouchableOpacity, View } from "react-native";

import { IconMapping, IconSymbol } from "./icon-symbol";

export interface CardResumeProps {
  title: string;
  number: number;
  icon: IconMapping;
  color: string;
  onPress: () => void;
}

export function CardResume({ number, title, icon, color, onPress }: CardResumeProps) {
  return (
    <TouchableOpacity
      className="flex-1 bg-surface rounded-2xl border border-border"
      style={{ aspectRatio: 1.7 }}
      onPress={onPress}
    >
      <View
        className="w-2 h-full rounded-xl"
        style={{
          backgroundColor: color,
          position: "absolute",
          left: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
      <View className="flex-row gap-4 p-4 h-full">
        <View className="flex-1 flex justify-between">
          <Text className="text-3xl text-black font-bold">{number}</Text>
          <Text className="text-md text-muted">{title}</Text>
        </View>
        <IconSymbol name={icon} color={color} size={28} />
      </View>
    </TouchableOpacity>
  );
}
