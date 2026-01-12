import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface StatusChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
}

export function StatusChip({ label, selected, onPress, className }: StatusChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-2xl border ${className} ${selected ? "bg-primary border-primary" : "bg-surface border-border"}`}
    >
      <Text className={`text-sm font-medium ${selected ? "text-background" : "text-foreground"}`}>{label}</Text>
    </TouchableOpacity>
  );
}
