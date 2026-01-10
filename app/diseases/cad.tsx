import { FormInput, FormSelect } from "@/components";
import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors, useNavigation, useScreenHeader } from "@/hooks";
import { cattleStorage, diseaseStorage } from "@/lib/storage";
import { Cattle, DiseaseResult, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DISEASE_RESULTS: DiseaseResult[] = Object.keys(DISEASE_RESULT_LABELS) as DiseaseResult[];

export default function DiseaseCadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "DiseasesCad">>();
  const colors = useColors();
  const { id, cattleId } = route.params;
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Doença" : "Registrar Doença");

  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    cattleId?: string;
    type: string;
    diagnosisDate: Date | null;
    symptoms: string;
    treatment: string;
    result: DiseaseResult;
  }>({
    cattleId: cattleId,
    type: "",
    diagnosisDate: new Date(),
    symptoms: "",
    treatment: "",
    result: "in_treatment",
  });

  const loadCattle = useCallback(async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      console.error("Error loading cattle:", error);
    } finally {
      setLoadingCattle(false);
    }
  }, []);

  const loadDisease = useCallback(async () => {
    try {
      if (!id) return;
      const disease = await diseaseStorage.getById(id);
      if (disease) {
        setFormData({
          cattleId: disease.cattleId,
          type: disease.type,
          diagnosisDate: new Date(disease.diagnosisDate),
          symptoms: disease.symptoms || "",
          treatment: disease.treatment || "",
          result: disease.result,
        });
      }
    } catch (error) {
      console.error("Error loading disease:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da doença");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDisease();
  }, [loadDisease]);

  useEffect(() => {
    loadCattle();
  }, [loadCattle]);

  const handleSave = async () => {
    // Validações
    if (!formData.cattleId) {
      Alert.alert("Erro", "Selecione um animal");
      return;
    }

    if (!formData.type.trim()) {
      Alert.alert("Erro", "Informe o tipo de doença");
      return;
    }

    if (!formData.diagnosisDate) {
      Alert.alert("Erro", "A data de diagnóstico é obrigatória");
      return;
    }

    if (!formData.symptoms.trim()) {
      Alert.alert("Erro", "Informe os sintomas");
      return;
    }

    if (!formData.treatment.trim()) {
      Alert.alert("Erro", "Informe o tratamento");
      return;
    }
    try {
      setSaving(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await diseaseStorage.add({
        cattleId: formData.cattleId,
        type: formData.type.trim(),
        diagnosisDate: formData.diagnosisDate.toISOString(),
        symptoms: formData.symptoms.trim(),
        treatment: formData.treatment.trim(),
        result: formData.result,
      });

      await diseaseStorage.update(id!, {
        type: formData.type.trim(),
        diagnosisDate: formData.diagnosisDate.toISOString(),
        symptoms: formData.symptoms.trim(),
        treatment: formData.treatment.trim(),
        result: formData.result,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", id ? "Doença atualizada com sucesso!" : "Doença registrada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating disease:", error);
      Alert.alert("Erro", "Não foi possível atualizar a doença");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingCattle) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6" style={{ paddingBottom: insets.bottom }}>
          {/* Form Fields */}
          <View className="gap-4">
            <FormSelect
              label="Animal"
              value={formData.cattleId || ""}
              onValueChange={(value) => setFormData({ ...formData, cattleId: value })}
              options={cattle.map((c) => ({ label: c.name || `Animal ${c.number}`, value: c.id }))}
              placeholder="Selecionar animal"
              required
              disabled={!!id || !!cattleId}
            />

            {/* Tipo de Doença */}
            <FormInput
              label="Tipo de Doença"
              value={formData.type}
              onChangeText={(text) => setFormData({ ...formData, type: text })}
              placeholder="Ex: Mastite"
              disabled={saving}
            />

            {/* Data de Diagnóstico */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data de Diagnóstico *</Text>
              <CustomDatePicker
                value={formData.diagnosisDate}
                onChange={(date) => setFormData({ ...formData, diagnosisDate: date })}
                maximumDate={new Date()}
                disabled={saving}
              />
            </View>

            {/* Sintomas */}
            <FormInput
              label="Sintomas (Opcional)"
              value={formData.symptoms}
              onChangeText={(text) => setFormData({ ...formData, symptoms: text })}
              placeholder="Descreva os sintomas observados"
              multiline
              numberOfLines={3}
              disabled={saving}
            />

            {/* Tratamento */}
            <FormInput
              label="Tratamento (Opcional)"
              value={formData.treatment}
              onChangeText={(text) => setFormData({ ...formData, treatment: text })}
              placeholder="Descreva o tratamento realizado"
              multiline
              numberOfLines={3}
              disabled={saving}
            />
            {/* Resultado */}
            <FormSelect
              label="Resultado"
              value={formData.result || ""}
              onValueChange={(value) => setFormData({ ...formData, result: value as DiseaseResult })}
              options={DISEASE_RESULTS.map((c) => ({
                label: `${DISEASE_RESULT_LABELS[c].icon} ${DISEASE_RESULT_LABELS[c].text}`,
                value: c,
              }))}
              placeholder="Selecionar animal"
              required
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
