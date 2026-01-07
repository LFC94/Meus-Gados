import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { diseaseStorage } from "@/lib/storage";
import { DiseaseResult, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const DISEASE_RESULTS: DiseaseResult[] = ["in_treatment", "cured", "death"];

export default function EditDiseaseScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "DiseasesEdit">>();
  const colors = useColors();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    type: string;
    diagnosisDate: Date;
    symptoms: string;
    treatment: string;
    result: DiseaseResult;
  }>({
    type: "",
    diagnosisDate: new Date(),
    symptoms: "",
    treatment: "",
    result: "in_treatment",
  });
  const [showResultPicker, setShowResultPicker] = useState(false);

  useEffect(() => {
    loadDisease();
  }, [id]);

  const loadDisease = async () => {
    try {
      if (!id) return;
      const disease = await diseaseStorage.getById(id);
      if (disease) {
        setFormData({
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
  };

  const handleSave = async () => {
    if (!formData.type.trim()) {
      Alert.alert("Erro", "O tipo de doença é obrigatório");
      return;
    }

    try {
      setSaving(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

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

      Alert.alert("Sucesso", "Doença atualizada com sucesso!", [
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
            <Text className="text-3xl font-bold text-foreground">Editar Doença</Text>
            <Text className="text-base text-muted">Atualize os dados da doença</Text>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {/* Tipo de Doença */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Tipo de Doença *</Text>
              <TextInput
                placeholder="Ex: Mastite"
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                editable={!saving}
              />
            </View>

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
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Sintomas (Opcional)</Text>
              <TextInput
                placeholder="Descreva os sintomas observados"
                value={formData.symptoms}
                onChangeText={(text) => setFormData({ ...formData, symptoms: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                editable={!saving}
              />
            </View>

            {/* Tratamento */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Tratamento (Opcional)</Text>
              <TextInput
                placeholder="Descreva o tratamento realizado"
                value={formData.treatment}
                onChangeText={(text) => setFormData({ ...formData, treatment: text })}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                editable={!saving}
              />
            </View>

            {/* Resultado */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Resultado *</Text>
              <TouchableOpacity
                onPress={() => setShowResultPicker(!showResultPicker)}
                disabled={saving}
                className="border border-border rounded-lg p-3 bg-surface"
              >
                <Text className="text-foreground">{DISEASE_RESULT_LABELS[formData.result]}</Text>
              </TouchableOpacity>
              {showResultPicker && (
                <View className="border border-border rounded-lg bg-surface p-2 gap-2">
                  {DISEASE_RESULTS.map((result) => (
                    <TouchableOpacity
                      key={result}
                      onPress={() => {
                        setFormData({ ...formData, result });
                        setShowResultPicker(false);
                      }}
                      className="p-3 border-b border-border"
                    >
                      <Text className={formData.result === result ? "font-bold text-primary" : "text-foreground"}>
                        {DISEASE_RESULT_LABELS[result as DiseaseResult]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
