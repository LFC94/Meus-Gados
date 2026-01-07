import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { vaccinationRecordStorage, vaccineCatalogStorage } from "@/lib/storage";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditVaccineScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const route = useRoute<RouteProp<RootStackParamList, "VaccineEdit">>();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    appliedDate: new Date(),
    nextDose: new Date(),
    batch: "",
  });

  useEffect(() => {
    loadVaccine();
  }, [id]);

  const loadVaccine = async () => {
    try {
      if (!id) return;
      const vaccination = await vaccinationRecordStorage.getById(id);
      if (vaccination) {
        const vaccine = await vaccineCatalogStorage.getById(vaccination.vaccineId);
        if (!vaccine) {
          return;
        }
        setFormData({
          name: vaccine.name,
          appliedDate: new Date(vaccination.dateApplied),
          nextDose: vaccination.nextDoseDate ? new Date(vaccination.nextDoseDate) : new Date(),
          batch: vaccination.batchUsed || "",
        });
      }
    } catch (error) {
      console.error("Error loading vaccine:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da vacina");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "O nome da vacina é obrigatório");
      return;
    }

    try {
      setSaving(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await vaccinationRecordStorage.update(id!, {
        dateApplied: formData.appliedDate.toISOString(),
        nextDoseDate: formData.nextDose.toISOString(),
        batchUsed: formData.batch.trim(),
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Vacina atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating vaccine:", error);
      Alert.alert("Erro", "Não foi possível atualizar a vacina");
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
            <Text className="text-base text-muted">Atualize os dados da vacina</Text>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {/* Nome da Vacina */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Nome da Vacina *</Text>
              <TextInput
                placeholder="Ex: Raiva"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                editable={!saving}
              />
            </View>

            {/* Data Aplicada */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data Aplicada *</Text>
              <CustomDatePicker
                value={formData.appliedDate}
                onChange={(date) => setFormData({ ...formData, appliedDate: date })}
                maximumDate={new Date()}
                disabled={saving}
              />
            </View>

            {/* Próxima Dose */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data da Próxima Dose *</Text>
              <CustomDatePicker
                value={formData.nextDose}
                onChange={(date) => setFormData({ ...formData, nextDose: date })}
                minimumDate={formData.appliedDate}
                disabled={saving}
              />
            </View>

            {/* Lote */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Lote da Vacina (Opcional)</Text>
              <TextInput
                placeholder="Ex: ABC123456"
                value={formData.batch}
                onChangeText={(text) => setFormData({ ...formData, batch: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                editable={!saving}
              />
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
