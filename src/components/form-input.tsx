import React, { useState } from "react";
import { ScrollView, StyleProp, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

import { IconSymbol } from "@/components/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad" | "decimal-pad";
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "next" | "go";
  horizontal?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  multiline = false,
  numberOfLines = 1,
  error,
  required = false,
  disabled = false,
  onSubmitEditing,
  returnKeyType = "done",
  horizontal = false,
  containerStyle,
  labelStyle,
  inputStyle,
}: FormInputProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);

  if (horizontal) {
    return (
      <View className="flex-1" style={containerStyle}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-medium text-foreground" style={labelStyle}>
              {label}
            </Text>
            {required && <Text className="text-error">*</Text>}
          </View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            keyboardType={keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={!disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            className="text-base text-foreground p-0 ml-4 font-semibold bg-surface rounded-xl"
            style={[
              {
                flex: 1,
                minHeight: multiline ? numberOfLines * 20 : 40,
                textAlignVertical: multiline ? "top" : "center",
                textAlign: multiline ? "left" : "center",
              },
              inputStyle,
            ]}
          />
        </View>
        {error && <Text className="text-error text-xs mt-1">{error}</Text>}
      </View>
    );
  }

  return (
    <View className="gap-1.5" style={containerStyle}>
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-medium text-foreground" style={labelStyle}>
          {label}
        </Text>
        {required && <Text className="text-error">*</Text>}
      </View>
      <View
        className={`rounded-xl px-4 py-3 border ${
          error ? "border-error" : isFocused ? "border-primary" : "border-border"
        } ${disabled ? "bg-surface/50" : "bg-surface"}`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          className="text-base text-foreground m-0 p-0 "
          style={[
            {
              minHeight: multiline ? numberOfLines * 20 : undefined,
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ]}
        />
      </View>
      {error && <Text className="text-error text-xs">{error}</Text>}
    </View>
  );
}

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
