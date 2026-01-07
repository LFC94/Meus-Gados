import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { DISEASE_RESULT_LABELS } from "@/constants/const";
import { useColors, useNavigation } from "@/hooks";
import { cattleStorage, diseaseStorage } from "@/lib/storage";
import { Cattle, DiseaseResult } from "@/types";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddDiseaseScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [showCattlePicker, setShowCattlePicker] = useState(false);
  const [showResultPicker, setShowResultPicker] = useState(false);
  const [formData, setFormData] = useState({
    cattleId: "",
    type: "",
    diagnosisDate: new Date(),
    symptoms: "",
    treatment: "",
    result: "in_treatment" as DiseaseResult,
  });

  const resultOptions: DiseaseResult[] = ["in_treatment", "cured", "death"];

  useEffect(() => {
    loadCattle();
  }, []);

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
      setLoading(true);

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

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Doença registrada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error saving disease:", error);
      Alert.alert("Erro", "Não foi possível registrar a doença");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCattle) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Registrar Doença</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
            style={{ opacity: 1 }}
          >
            <Text className="text-primary font-semibold text-base">Voltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4 pb-6">
            {/* Animal */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Animal *</Text>
              <TouchableOpacity
                onPress={() => setShowCattlePicker(!showCattlePicker)}
                className="bg-surface rounded-xl px-4 py-3 border border-border"
                style={{ opacity: 1 }}
              >
                <Text className="text-base" style={{ color: formData.cattleId ? colors.foreground : colors.muted }}>
                  {getSelectedCattleName()}
                </Text>
              </TouchableOpacity>

              {showCattlePicker && (
                <View className="mt-2 bg-surface rounded-xl border border-border overflow-hidden">
                  <ScrollView style={{ maxHeight: 200 }}>
                    {cattle.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          setFormData({ ...formData, cattleId: item.id });
                          setShowCattlePicker(false);
                        }}
                        className="px-4 py-3 border-b border-border"
                        style={{ opacity: 1 }}
                      >
                        <Text
                          className="text-base"
                          style={{
                            color: formData.cattleId === item.id ? colors.primary : colors.foreground,
                            fontWeight: formData.cattleId === item.id ? "600" : "400",
                          }}
                        >
                          {item.name || `Animal ${item.number}`}
                        </Text>
                        <Text className="text-xs text-muted mt-1">Nº {item.number}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Tipo de Doença */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Tipo de Doença *</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Ex: Mastite, Pneumonia, etc"
                  placeholderTextColor={colors.muted}
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  className="text-base text-foreground"
                  style={{ padding: 0 }}
                />
              </View>
            </View>

            {/* Data de Diagnóstico */}
            <CustomDatePicker
              label="Data de Diagnóstico *"
              value={formData.diagnosisDate}
              onChange={(date) => setFormData({ ...formData, diagnosisDate: date })}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            {/* Sintomas */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Sintomas *</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Descreva os sintomas observados"
                  placeholderTextColor={colors.muted}
                  value={formData.symptoms}
                  onChangeText={(text) => setFormData({ ...formData, symptoms: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-base text-foreground"
                  style={{ padding: 0, minHeight: 80 }}
                />
              </View>
            </View>

            {/* Tratamento */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Tratamento *</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Descreva o tratamento aplicado"
                  placeholderTextColor={colors.muted}
                  value={formData.treatment}
                  onChangeText={(text) => setFormData({ ...formData, treatment: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-base text-foreground"
                  style={{ padding: 0, minHeight: 80 }}
                />
              </View>
            </View>

            {/* Resultado */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Status do Tratamento *</Text>
              <TouchableOpacity
                onPress={() => setShowResultPicker(!showResultPicker)}
                className="bg-surface rounded-xl px-4 py-3 border border-border"
                style={{ opacity: 1 }}
              >
                <Text className="text-base text-foreground">{DISEASE_RESULT_LABELS[formData.result]}</Text>
              </TouchableOpacity>

              {showResultPicker && (
                <View className="mt-2 bg-surface rounded-xl border border-border overflow-hidden">
                  {resultOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setFormData({ ...formData, result: option });
                        setShowResultPicker(false);
                      }}
                      className="px-4 py-3 border-b border-border"
                      style={{ opacity: 1 }}
                    >
                      <Text
                        className="text-base"
                        style={{
                          color: formData.result === option ? colors.primary : colors.foreground,
                          fontWeight: formData.result === option ? "600" : "400",
                        }}
                      >
                        {DISEASE_RESULT_LABELS[option]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary rounded-full p-4 items-center"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Doença</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
