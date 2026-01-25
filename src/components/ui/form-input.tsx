import { useState } from "react";
import { StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";

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
          {label && (
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-foreground" style={labelStyle}>
                {label}
              </Text>
              {required && <Text className="text-error">*</Text>}
            </View>
          )}
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
      {label && (
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-medium text-foreground" style={labelStyle}>
            {label}
          </Text>
          {required && <Text className="text-error">*</Text>}
        </View>
      )}
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
