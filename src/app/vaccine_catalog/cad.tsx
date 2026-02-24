import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput, LoadingScreen } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { COMMON_VACCINES } from "@/constants/const";
import { useNavigation, useScreenHeader } from "@/hooks";
import { logger } from "@/lib/logger";
import { vaccineCatalogStorage } from "@/lib/storage";
import { RootStackParamList } from "@/types";

export default function VaccineCatalogCadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "VaccineCatalogCad">>();
  const id = route.params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const insets = useSafeAreaInsets();

  useScreenHeader(
    id ? "Editar Vacina" : "Nova Vacina",
    id ? "Atualize as informações da vaccine no catálogo" : "Cadastre uma vaccine no catálogo para uso futuro",
  );

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: null as Date | null,
    description: "",
    daysBetweenDoses: 0,
    isActive: true,
  });

  const loadVaccine = useCallback(async () => {
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
      logger.error("VaccineCatalogCad/loadVaccine", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da vaccine");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVaccine();
  }, [loadVaccine]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome da vaccine é obrigatório");
      return;
    }

    try {
      setSaving(true);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const data = {
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim() || undefined,
        batchNumber: formData.batchNumber.trim() || undefined,
        expiryDate: formData.expiryDate?.toISOString(),
        description: formData.description.trim() || undefined,
        daysBetweenDoses: formData.daysBetweenDoses || undefined,
        isActive: formData.isActive,
      };
      if (id) {
        await vaccineCatalogStorage.update(id!, data);
      } else {
        await vaccineCatalogStorage.add(data);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Sucesso", id ? "Vaccine atualizada com sucesso!" : "Vaccine cadastrada com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      logger.error("VaccineCatalogCad/save", error);
      Alert.alert("Erro", "Não foi possível atualizar a vaccine");
    } finally {
      setSaving(false);
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

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer className="p-0">
      {/* Templates Rápidos */}
      {formData.name === "" && (
        <View className="gap-2 p-4">
          <Text className="text-sm font-semibold text-foreground">Usar Modelo Rápido</Text>
          <View className="flex-row gap-2 border border-border rounded-lg p-2 bg-surface" style={{ flexWrap: "wrap" }}>
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
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4" style={{ paddingBottom: insets.bottom }}>
        <View className="gap-6">
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
            <FormInput
              label="Nome da Vacina"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Febre Aftosa"
              required
            />

            {/* Intervalo entre Doses */}
            <FormInput
              label="Intervalo entre Doses (dias)"
              value={formData.daysBetweenDoses.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setFormData({ ...formData, daysBetweenDoses: num });
              }}
              placeholder="0 para dose única"
              keyboardType="numeric"
            />

            {/* Descrição */}
            <FormInput
              label="Descrição / Tratamento"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Ex: Imunização contra febre aftosa"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Buttons */}
          <View className="gap-3 mt-6">
            <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary rounded-lg p-4 items-center">
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Salvar</Text>
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
