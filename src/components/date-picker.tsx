import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

import { IconSymbol } from "./icon-symbol";

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export function CustomDatePicker({
  label,
  value,
  onChange,
  placeholder = "Selecionar data",
  minimumDate,
  maximumDate,
  disabled = false,
}: DatePickerProps) {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date: Date | null): string => {
    if (!date) return placeholder;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS - apenas atualiza o estado temporário
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <View className="gap-2">
      {label && <Text className="text-sm font-semibold text-foreground">{label}</Text>}
      <View className="flex-row items-center gap-1">
        <TouchableOpacity
          onPress={() => !disabled && setShowPicker(true)}
          disabled={disabled}
          className="flex-1 bg-surface rounded-xl px-4 py-2 border border-border flex-row items-center justify-between"
          style={{ opacity: disabled ? 0.5 : 1, height: 43 }}
        >
          <Text className="text-base" style={{ color: value ? colors.foreground : colors.muted }}>
            {formatDate(value)}
          </Text>
          {value && !disabled && (
            <TouchableOpacity onPress={handleClear} className="p-1 -mr-2">
              <IconSymbol name="cancel" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {showPicker && (
        <>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />

          {Platform.OS === "ios" && (
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-surface rounded-xl p-3 border border-border items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirm} className="flex-1 bg-primary rounded-xl p-3 items-center">
                <Text className="text-background font-semibold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
