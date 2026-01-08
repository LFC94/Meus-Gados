import { useColors } from "@/hooks/use-colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
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

  return (
    <View className="gap-2">
      {label && <Text className="text-sm font-semibold text-foreground">{label}</Text>}
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        className="bg-surface rounded-xl px-4 py-3 border border-border"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Text className="text-base" style={{ color: value ? colors.foreground : colors.muted }}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>
      {showPicker && Platform.OS === "web" && (
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCancel}>
          <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <View className="bg-background rounded-2xl p-6 w-full max-w-sm gap-4">
              <Text className="text-lg font-semibold text-foreground">{label || "Selecionar Data"}</Text>

              <View className="bg-surface rounded-xl p-4 border border-border">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 bg-surface rounded-xl p-3 border border-border items-center"
                  style={{ opacity: 1 }}
                >
                  <Text className="text-foreground font-semibold">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirm}
                  className="flex-1 bg-primary rounded-xl p-3 items-center"
                  style={{ opacity: 1 }}
                >
                  <Text className="text-background font-semibold">Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
      {Platform.OS === "ios" && showPicker && (
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 bg-surface rounded-xl p-3 border border-border items-center"
            style={{ opacity: 1 }}
          >
            <Text className="text-foreground font-semibold">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            className="flex-1 bg-primary rounded-xl p-3 items-center"
            style={{ opacity: 1 }}
          >
            <Text className="text-background font-semibold">Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
