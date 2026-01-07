import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { vaccineCatalogStorage } from "@/lib/storage";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditVaccineScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "VaccineCatalogEdit">>();
  const colors = useColors();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: null as Date | null,
    description: "",
    daysBetweenDoses: 0,
    isActive: true,
  });

  useEffect(() => {
    loadVaccine();
  }, [id]);

  const loadVaccine = async () => {
    try {
      if (!id) return;
      const vaccine = await vaccineCatalogStorage.getById(id);
      if (vaccine) {
        setFormData({
          name: vaccine.name,
          manufacturer: vaccine.manufacturer || "",
          batchNumber: vaccine.batchNumber || "",
          expiryDate: vaccine.expiryDate ? new Date(vaccine.expiryDate) : null,
          description: vaccine.description || "",
          daysBetweenDoses: vaccine.daysBetweenDoses || 0,
          isActive: vaccine.isActive,
        });
      }
    } catch (error) {
      console.error("Error loading vaccine:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da vaccine");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome da vaccine é obrigatório");
      return;
    }

    try {
      setSaving(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await vaccineCatalogStorage.update(id!, {
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim() || undefined,
        batchNumber: formData.batchNumber.trim() || undefined,
        expiryDate: formData.expiryDate?.toISOString(),
        description: formData.description.trim() || undefined,
        daysBetweenDoses: formData.daysBetweenDoses || undefined,
        isActive: formData.isActive,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Vaccine atualizada com sucesso!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Error updating vaccine:", error);
      Alert.alert("Erro", "Não foi possível atualizar a vaccine");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Editar Vacina</Text>
            <Text className="text-base text-muted">Atualize as informações da vaccine no catálogo</Text>
          </View>

          {/* Status Badge */}
          {!formData.isActive && (
            <View className="bg-error/10 rounded-xl p-4 border border-error">
              <Text className="text-error font-semibold">
                ⚠️ Esta vaccine está marcada como inativa e não aparecerá nas listas de seleção.
              </Text>
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
            <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary rounded-lg p-4 items-center">
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Salvar Alterações</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={saving}
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
