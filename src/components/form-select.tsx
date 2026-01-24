import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

import { FormInput } from "./form-input";
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
  const [search, setSearch] = useState(""); // Added search state

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase())); // Added filtering logic

  const handleClose = () => {
    // Added handleClose function
    setShowOptions(false);
    setSearch("");
  };

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        {required && <Text className="text-error">*</Text>}
      </View>
      <TouchableOpacity
        onPress={() => !disabled && setShowOptions(true)}
        className={`rounded-xl px-4 py-3 border ${
          error ? "border-error" : showOptions ? "border-primary" : "border-border"
        } ${disabled ? "bg-surface/40" : "bg-surface"}`}
        style={{ opacity: disabled ? 0.5 : 1 }}
        accessibilityLabel={displayText}
        accessibilityRole="combobox"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base" style={{ color: selectedOption ? colors.foreground : colors.muted }}>
            {displayText}
          </Text>
          <IconSymbol name="keyboard-arrow-down" size={20} color={colors.muted} />
        </View>
      </TouchableOpacity>
      {error && <Text className="text-error text-xs">{error}</Text>}
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center"
          style={{ padding: 24 }}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View
            className="bg-surface rounded-xl overflow-hidden shadow-lg border border-border"
            style={{ maxHeight: "80%" }}
          >
            <View className="p-3 border-b border-border flex-row justify-between items-center bg-muted/10">
              <Text className="font-bold text-lg text-foreground">{label}</Text>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <IconSymbol name="cancel" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {filteredOptions.length > 5 && (
              <View className="py-2 bg-muted/10">
                <FormInput
                  label=""
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Pesquisar..."
                  containerStyle={{ margin: 0 }}
                />
              </View>
            )}

            <ScrollView className="mb-2">
              {filteredOptions.length === 0 ? (
                <View className="p-4 items-center">
                  <Text className="text-muted">Nenhuma opção encontrada</Text>
                </View>
              ) : (
                filteredOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onValueChange(option.value);
                      handleClose();
                    }}
                    className="px-4 py-4 border-b border-border"
                    style={{ backgroundColor: value === option.value ? `${colors.primary}20` : "" }}
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
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
