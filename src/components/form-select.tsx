import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

import { IconSymbol } from "./icon-symbol";

interface FormSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Selecione...",
  error,
  required = false,
  disabled = false,
}: FormSelectProps) {
  const colors = useColors();
  const [showOptions, setShowOptions] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        {required && <Text className="text-error">*</Text>}
      </View>
      <TouchableOpacity
        onPress={() => !disabled && setShowOptions(!showOptions)}
        className={`rounded-xl px-4 py-3 border ${
          error ? "border-error" : showOptions ? "border-primary" : "border-border"
        } ${disabled ? "bg-surface/50" : "bg-surface"}`}
        style={{ opacity: disabled ? 0.6 : 1 }}
        accessibilityLabel={displayText}
        accessibilityRole="combobox"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base" style={{ color: selectedOption ? colors.foreground : colors.muted }}>
            {displayText}
          </Text>
          <IconSymbol name={showOptions ? "chevron.up" : "chevron.down"} size={20} color={colors.muted} />
        </View>
      </TouchableOpacity>
      {error && <Text className="text-error text-xs">{error}</Text>}
      {showOptions && !disabled && (
        <View className="mt-1 bg-surface rounded-xl border border-border overflow-hidden">
          <ScrollView style={{ maxHeight: 200 }}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onValueChange(option.value);
                  setShowOptions(false);
                }}
                className={`px-4 py-3 border-b border-border ${value === option.value ? "bg-primary/10" : ""}`}
                style={{ opacity: 1 }}
              >
                <Text
                  className="text-base"
                  style={{
                    color: value === option.value ? colors.primary : colors.foreground,
                    fontWeight: value === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
