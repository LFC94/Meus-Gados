import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomDatePicker, FormInput, FormSelect, ScreenContainer } from "@/components";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors, useFormScreen, useNavigation, useScreenHeader } from "@/hooks";
import { logger } from "@/lib/logger";
import { cattleStorage, diseaseStorage } from "@/lib/storage";
import { Cattle, DiseaseFormData, DiseaseResult, RootStackParamList } from "@/types";

const DISEASE_RESULTS: DiseaseResult[] = Object.keys(DISEASE_RESULT_LABELS) as DiseaseResult[];

export default function DiseaseCadScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "DiseasesCad">>();
  const navigation = useNavigation();
  const colors = useColors();
  const { id, cattleId } = route.params;
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Doença" : "Registrar Doença");

  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);

  const initialData: DiseaseFormData = {
    cattleId: cattleId,
    type: "",
    diagnosisDate: new Date(),
    symptoms: "",
    treatment: "",
    result: "in_treatment",
  };

  const loadCattle = useCallback(async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      logger.error("DiseasesCad/loadCattle", error);
    } finally {
      setLoadingCattle(false);
    }
  }, []);

  useEffect(() => {
    loadCattle();
  }, [loadCattle]);

  const loadData = useCallback(async () => {
    if (!id) return null;
    const disease = await diseaseStorage.getById(id);
    if (disease) {
      return {
        cattleId: disease.cattleId,
        type: disease.type,
        diagnosisDate: new Date(disease.diagnosisDate),
        symptoms: disease.symptoms || "",
        treatment: disease.treatment || "",
        result: disease.result,
      };
    }
    return null;
  }, [id]);

  const validate = useCallback((data: DiseaseFormData): string | null => {
    if (!data.cattleId) return "Selecione um animal";
    if (!data.type.trim()) return "Informe o tipo de doença";
    if (!data.diagnosisDate) return "A data de diagnóstico é obrigatória";
    if (!data.symptoms.trim()) return "Informe os sintomas";
    if (!data.treatment.trim()) return "Informe o tratamento";
    return null;
  }, []);

  const onSave = useCallback(
    async (formData: DiseaseFormData) => {
      const payload = {
        cattleId: formData.cattleId!,
        type: formData.type.trim(),
        diagnosisDate: formData.diagnosisDate!.toISOString(),
        symptoms: formData.symptoms.trim(),
        treatment: formData.treatment.trim(),
        result: formData.result,
      };

      if (id) {
        await diseaseStorage.update(id, payload);
      } else {
        await diseaseStorage.add(payload);
      }
    },
    [id],
  );

  const { data, setData, loading, saving, save } = useFormScreen<DiseaseFormData>({
    initialData,
    loadData,
    validate,
    onSave,
    successMessage: id ? "Doença atualizada com sucesso!" : "Doença registrada com sucesso!",
  });

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
          <View className="gap-4">
            <FormSelect
              label="Animal"
              value={data.cattleId || ""}
              onValueChange={(value) => setData({ ...data, cattleId: value })}
              options={cattle.map((c) => ({
                label: c.name || `Animal ${c.number}`,
                value: c.id,
              }))}
              placeholder="Selecionar animal"
              required
              disabled={!!id || !!cattleId}
            />

            <FormInput
              label="Tipo de Doença"
              value={data.type}
              onChangeText={(text) => setData({ ...data, type: text })}
              placeholder="Ex: Mastite"
              disabled={saving}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data de Diagnóstico *</Text>
              <CustomDatePicker
                value={data.diagnosisDate}
                onChange={(date) => setData({ ...data, diagnosisDate: date })}
                maximumDate={new Date()}
                disabled={saving}
              />
            </View>

            <FormInput
              label="Sintomas (Opcional)"
              value={data.symptoms}
              onChangeText={(text) => setData({ ...data, symptoms: text })}
              placeholder="Descreva os sintomas observados"
              multiline
              numberOfLines={3}
              disabled={saving}
            />

            <FormInput
              label="Tratamento (Opcional)"
              value={data.treatment}
              onChangeText={(text) => setData({ ...data, treatment: text })}
              placeholder="Descreva o tratamento realizado"
              multiline
              numberOfLines={3}
              disabled={saving}
            />

            <FormSelect
              label="Resultado"
              value={data.result || ""}
              onValueChange={(value) => setData({ ...data, result: value as DiseaseResult })}
              options={DISEASE_RESULTS.map((c) => ({
                label: `${DISEASE_RESULT_LABELS[c].text}`,
                value: c,
              }))}
              placeholder="Selecionar animal"
              required
            />
          </View>

          <View className="gap-3 mt-6">
            <TouchableOpacity onPress={save} disabled={saving} className="bg-primary rounded-lg p-4 items-center">
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
