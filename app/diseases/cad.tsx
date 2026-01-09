import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors, useNavigation, useScreenHeader } from "@/hooks";
import { cattleStorage, diseaseStorage } from "@/lib/storage";
import { Cattle, DiseaseResult, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    diagnosisDate: Date;
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
  const [showResultPicker, setShowResultPicker] = useState(false);

  useEffect(() => {
    loadDisease();
  }, [id]);

  useEffect(() => {
    loadCattle();
  }, [formData.cattleId]);

  const loadCattle = async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      console.error("Error loading cattle:", error);
    } finally {
      setLoadingCattle(false);
    }
  };

  const getSelectedCattleName = () => {
    const selected = cattle.find((c) => c.id === formData.cattleId);
    return selected ? selected.name || `Animal ${selected.number}` : "Selecionar animal";
  };

  const loadDisease = async () => {
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
  };

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
            {/* Animal */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Animal *</Text>
              <TextInput
                placeholder="Ex: Mastite"
                value={getSelectedCattleName()}
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholderTextColor={colors.muted}
                editable={false}
              />
            </View>
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
                style={showResultPicker ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}}
              >
                <Text className="text-foreground">
                  {DISEASE_RESULT_LABELS[formData.result].icon} {DISEASE_RESULT_LABELS[formData.result].text}
                </Text>
              </TouchableOpacity>
              {showResultPicker && (
                <View
                  className="border border-border rounded-lg  p-2 gap-2"
                  style={{ marginTop: -7, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                >
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
                        {DISEASE_RESULT_LABELS[result as DiseaseResult].icon}{" "}
                        {DISEASE_RESULT_LABELS[result as DiseaseResult].text}
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
