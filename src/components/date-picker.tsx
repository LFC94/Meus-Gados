import { useColors } from "@/hooks/use-colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
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

  if (Platform.OS === "web") {
    return (
      <View className="gap-2">
        {label && <Text className="text-sm font-semibold text-foreground">{label}</Text>}
        <View className="relative flex-row items-center">
          <input
            type="date"
            disabled={disabled}
            value={value ? value.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                // Browser returns YYYY-MM-DD
                const parts = val.split("-");
                if (parts.length === 3) {
                  const year = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10);
                  const day = parseInt(parts[2], 10);

                  // Only update if we have a reasonably complete date to avoid "jumping"
                  // While typing years like 2025, the browser might emit intermediate dates
                  if (year > 1000 && !isNaN(month) && !isNaN(day)) {
                    const newDate = new Date(year, month - 1, day);
                    if (!isNaN(newDate.getTime())) {
                      onChange(newDate);
                    }
                  }
                }
              } else {
                onChange(null);
              }
            }}
            style={{
              width: "100%",
              padding: "12px 40px 12px 16px", // Space for clear button
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface as any,
              color: value ? colors.foreground : colors.muted,
              fontSize: "16px",
              fontFamily: "inherit",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              WebkitAppearance: "none", // Attempt to hide some native UI
            }}
          />
          {/* Style hack to hide native browser date icons to avoid overlap */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            input[type="date"]::-webkit-calendar-picker-indicator {
              background: transparent;
              bottom: 0;
              color: transparent;
              cursor: pointer;
              height: auto;
              left: 0;
              position: absolute;
              right: 0;
              top: 0;
              width: auto;
            }
            input[type="date"]::-webkit-inner-spin-button,
            input[type="date"]::-webkit-clear-button {
              display: none;
              -webkit-appearance: none;
            }
          `,
            }}
          />
          {value && !disabled && (
            <TouchableOpacity
              onPress={handleClear}
              className="absolute right-3 p-1"
              style={{
                top: "50%",
                marginTop: -16,
                zIndex: 2, // Ensure it's above the invisible native indicator
              }}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {label && <Text className="text-sm font-semibold text-foreground">{label}</Text>}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => !disabled && setShowPicker(true)}
          disabled={disabled}
          className="flex-1 bg-surface rounded-xl px-4 py-3 border border-border flex-row items-center justify-between"
          style={{ opacity: disabled ? 0.5 : 1, height: 50 }}
        >
          <Text className="text-base" style={{ color: value ? colors.foreground : colors.muted }}>
            {formatDate(value)}
          </Text>
          {value && !disabled && (
            <TouchableOpacity onPress={handleClear} className="p-1 -mr-2">
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
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
