import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormSelect } from "@/components";
import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useColors, useNavigation, useScreenHeader } from "@/hooks";
import { calculateExpectedBirthDateAsDate } from "@/lib/helpers";
import { schedulePregnancyNotification } from "@/lib/notifications";
import { cattleStorage, pregnancyStorage } from "@/lib/storage";
import { Cattle, RootStackParamList } from "@/types";

export default function AddPregnancyScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "PregnancyAdd">>();
  const { cattleId } = route.params;
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [formData, setFormData] = useState<{
    cattleId: string | undefined;
    coverageDate: Date | null;
    expectedBirthDate: Date | null;
  }>({
    cattleId: cattleId,
    coverageDate: new Date(),
    expectedBirthDate: new Date(),
  });

  const insets = useSafeAreaInsets();

  useScreenHeader("Registrar Gestação");

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

  useEffect(() => {
    loadCattle();
  }, [loadCattle]);

  useEffect(() => {
    if (formData.coverageDate) {
      const expected = calculateExpectedBirthDateAsDate(formData.coverageDate);
      setFormData((prev) => ({
        ...prev,
        expectedBirthDate: expected,
      }));
    }
  }, [formData.coverageDate]);

  const handleSave = async () => {
    // Validações
    if (!formData.cattleId) {
      Alert.alert("Erro", "Selecione um animal");
      return;
    }

    if (!formData.coverageDate) {
      Alert.alert("Erro", "A data de cobertura é obrigatória");
      return;
    }

    if (!formData.expectedBirthDate) {
      Alert.alert("Erro", "A data prevista de parto é obrigatória");
      return;
    }

    try {
      setLoading(true);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const pregnancy = await pregnancyStorage.add({
        cattleId: formData.cattleId,
        coverageDate: formData.coverageDate.toISOString(),
        expectedBirthDate: formData.expectedBirthDate.toISOString(),
        result: "pending",
      });

      // Agendar notificação para data prevista de parto
      const selectedCattle = cattle.find((c) => c.id === formData.cattleId);
      if (selectedCattle) {
        await schedulePregnancyNotification({
          ...pregnancy,
          cattleName: selectedCattle.name || `Animal ${selectedCattle.number}`,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Sucesso", "Gestação registrada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error saving pregnancy:", error);
      Alert.alert("Erro", "Não foi possível registrar a gestação");
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
      <View className="flex-1 gap-4" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4 pb-6">
            {/* Animal */}
            <FormSelect
              label="Animal (Vaca)"
              value={formData.cattleId || ""}
              onValueChange={(value) => setFormData({ ...formData, cattleId: value })}
              options={cattle.map((c) => ({ label: c.name || `Animal ${c.number}`, value: c.id }))}
              placeholder="Selecionar animal"
              required
            />
            {/* Data de Cobertura/Inseminação */}
            <CustomDatePicker
              label="Data de Cobertura/Inseminação *"
              value={formData.coverageDate}
              onChange={(date) => {
                if (date) {
                  setFormData({
                    ...formData,
                    coverageDate: date,
                    expectedBirthDate: calculateExpectedBirthDateAsDate(date),
                  });
                } else {
                  setFormData({
                    ...formData,
                    coverageDate: null,
                    expectedBirthDate: null,
                  });
                }
              }}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            {/* Data Prevista de Parto */}
            <CustomDatePicker
              label="Data Prevista de Parto *"
              value={formData.expectedBirthDate}
              onChange={(date) => setFormData({ ...formData, expectedBirthDate: date })}
              minimumDate={formData.coverageDate || undefined}
              placeholder="Selecionar data"
            />

            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-muted text-center">
                💡 A data prevista de parto é calculada automaticamente como 280 dias após a data de cobertura. Você
                pode ajustar manualmente se necessário.
              </Text>
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
            <Text className="text-background font-semibold text-base">Salvar Gestação</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
