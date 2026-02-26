import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/use-colors";

import { IconSymbol } from "./icon-symbol";

interface FormTimePickerProps {
  label: string;
  value: Date | string; // Date object or string "HH:mm"
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  horizontal?: boolean;
}

export function FormTimePicker({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  containerStyle,
  horizontal = false,
}: FormTimePickerProps) {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);

  // Parse value to date if string
  const dateValue = typeof value === "string" ? parseTimeString(value) : value;

  function parseTimeString(timeStr: string): Date {
    const d = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      d.setHours(hours);
      d.setMinutes(minutes);
      d.setSeconds(0);
      d.setMilliseconds(0);
    }
    return d;
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const displayValue = formatTime(dateValue);

  if (horizontal) {
    return (
      <View className="flex-1" style={containerStyle}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-medium text-foreground">{label}</Text>
            {required && <Text className="text-error">*</Text>}
          </View>

          <TouchableOpacity
            onPress={() => !disabled && setShowPicker(true)}
            disabled={disabled}
            className={`flex-row items-center gap-2 bg-surface rounded-xl px-4 py-3 border ${
              error ? "border-error" : showPicker ? "border-primary" : "border-border"
            }`}
            style={{ opacity: disabled ? 0.6 : 1 }}
          >
            <Text className="text-base text-foreground font-semibold">{displayValue}</Text>
            <IconSymbol name="timer" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
        {error && <Text className="text-error text-xs mt-1">{error}</Text>}

        {showPicker && (
          <DateTimePicker
            value={dateValue}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            is24Hour={true}
          />
        )}
      </View>
    );
  }

  return (
    <View className="gap-1.5" style={containerStyle}>
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        {required && <Text className="text-error">*</Text>}
      </View>

      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 border ${
          error ? "border-error" : showPicker ? "border-primary" : "border-border"
        }`}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <Text className="text-base text-foreground">{displayValue}</Text>
        <IconSymbol name="timer" size={20} color={colors.muted} />
      </TouchableOpacity>
      {error && <Text className="text-error text-xs">{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          is24Hour={true}
        />
      )}
    </View>
  );
}
