import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { COMMON_VACCINES } from "@/constants/const";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { vaccineCatalogStorage } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddVaccineScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: null as Date | null,
    description: "",
    daysBetweenDoses: 0,
  });

  const handleSave = async () => {
    // Validações
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome da vaccine é obrigatório");
      return;
    }

    try {
      setLoading(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await vaccineCatalogStorage.add({
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim() || undefined,
        batchNumber: formData.batchNumber.trim() || undefined,
        expiryDate: formData.expiryDate?.toISOString(),
        description: formData.description.trim() || undefined,
        daysBetweenDoses: formData.daysBetweenDoses || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Vaccine cadastrada com sucesso!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Error saving vaccine:", error);
      Alert.alert("Erro", "Não foi possível cadastrar a vaccine");
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: (typeof COMMON_VACCINES)[0]) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      daysBetweenDoses: template.daysBetweenDoses,
    });
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Nova Vacina</Text>
            <Text className="text-base text-muted">Cadastre uma vaccine no catálogo para uso futuro</Text>
          </View>

          {/* Templates Rápidos */}
          {formData.name === "" && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Usar Modelo Rápido</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {COMMON_VACCINES.map((template, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleUseTemplate(template)}
                      className="bg-surface border border-border rounded-lg px-3 py-2"
                      style={{ opacity: 1 }}
                    >
                      <Text className="text-sm text-foreground">{template.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Form Fields */}
          <View className="gap-4">
            {/* Nome */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                Nome da Vacina <Text className="text-error">*</Text>
              </Text>
              <View className="bg-surface rounded-xl border border-border">
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Ex: Febre Aftosa"
                  placeholderTextColor={colors.muted}
                  className="p-3 text-base text-foreground"
                />
              </View>
            </View>

            {/* Fabricante */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Fabricante</Text>
              <View className="bg-surface rounded-xl border border-border">
                <TextInput
                  value={formData.manufacturer}
                  onChangeText={(text) => setFormData({ ...formData, manufacturer: text })}
                  placeholder="Ex: Ourofino, MSD, Boehringer"
                  placeholderTextColor={colors.muted}
                  className="p-3 text-base text-foreground"
                />
              </View>
            </View>

            {/* Lote e Validade */}
            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">Lote Padrão</Text>
                <View className="bg-surface rounded-xl border border-border">
                  <TextInput
                    value={formData.batchNumber}
                    onChangeText={(text) => setFormData({ ...formData, batchNumber: text })}
                    placeholder="Ex: LOTE-2024-001"
                    placeholderTextColor={colors.muted}
                    className="p-3 text-base text-foreground"
                  />
                </View>
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground">Validade</Text>
                <CustomDatePicker
                  value={formData.expiryDate}
                  onChange={(date) => setFormData({ ...formData, expiryDate: date })}
                  placeholder="Selecionar"
                  maximumDate={new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)}
                />
              </View>
            </View>

            {/* Intervalo entre Doses */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Intervalo entre Doses (dias)</Text>
              <View className="bg-surface rounded-xl border border-border">
                <TextInput
                  value={formData.daysBetweenDoses.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setFormData({ ...formData, daysBetweenDoses: num });
                  }}
                  placeholder="0 para dose única"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  className="p-3 text-base text-foreground"
                />
              </View>
              <Text className="text-xs text-muted">
                Deixe 0 para vacunas de dose única. O sistema usará este intervalo para calcular a próxima dose
                automaticamente.
              </Text>
            </View>

            {/* Descrição */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Descrição / Tratamento</Text>
              <View className="bg-surface rounded-xl border border-border">
                <TextInput
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Ex: Imunização contra febre aftosa"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="p-3 text-base text-foreground"
                />
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3 mt-6">
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="bg-primary rounded-lg p-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Salvar Vacina</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}
              className="border border-border rounded-lg p-4 items-center"
            >
              <Text className="text-foreground font-semibold text-base">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
