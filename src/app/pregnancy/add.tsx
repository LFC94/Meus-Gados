import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomDatePicker, FormSelect, ScreenContainer } from "@/components";
import { useColors, useFormScreen, useNavigation, useScreenHeader } from "@/hooks";
import { calculateExpectedBirthDateAsDate } from "@/lib/helpers";
import { schedulePregnancyNotification } from "@/lib/notifications";
import { cattleStorage, pregnancyStorage } from "@/lib/storage";
import { Cattle, PregnancyFormData, RootStackParamList } from "@/types";

export default function AddPregnancyScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "PregnancyAdd">>();
  const navigation = useNavigation();
  const colors = useColors();
  const { cattleId } = route.params;
  const insets = useSafeAreaInsets();

  useScreenHeader("Registrar Gestação");

  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);

  const initialData: PregnancyFormData = {
    cattleId: cattleId,
    coverageDate: new Date(),
    expectedBirthDate: new Date(),
  };

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

  const validate = useCallback((data: PregnancyFormData): string | null => {
    if (!data.cattleId) return "Selecione um animal";
    if (!data.coverageDate) return "A data de cobertura é obrigatória";
    if (!data.expectedBirthDate) return "A data prevista de parto é obrigatória";
    return null;
  }, []);

  const onSave = useCallback(
    async (formData: PregnancyFormData) => {
      const pregnancy = await pregnancyStorage.add({
        cattleId: formData.cattleId!,
        coverageDate: formData.coverageDate!.toISOString(),
        expectedBirthDate: formData.expectedBirthDate!.toISOString(),
        result: "pending",
      });

      const selectedCattle = cattle.find((c) => c.id === formData.cattleId);
      if (selectedCattle) {
        await schedulePregnancyNotification({
          ...pregnancy,
          cattleName: selectedCattle.name || `Animal ${selectedCattle.number}`,
        });
      }
    },
    [cattle],
  );

  const handleSuccess = useCallback(() => {
    Alert.alert("Sucesso", "Gestação registrada com sucesso!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation]);

  const { data, setData, saving, save } = useFormScreen<PregnancyFormData>({
    initialData,
    validate,
    onSave,
    onSuccess: handleSuccess,
  });

  const handleCoverageDateChange = useCallback(
    (date: Date | null) => {
      if (date) {
        setData({
          ...data,
          coverageDate: date,
          expectedBirthDate: calculateExpectedBirthDateAsDate(date),
        });
      } else {
        setData({
          ...data,
          coverageDate: null,
          expectedBirthDate: null,
        });
      }
    },
    [data, setData],
  );

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
            <FormSelect
              label="Animal (Vaca)"
              value={data.cattleId || ""}
              onValueChange={(value) => setData({ ...data, cattleId: value })}
              options={cattle.map((c) => ({
                label: c.name || `Animal ${c.number}`,
                value: c.id,
              }))}
              placeholder="Selecionar animal"
              required
            />

            <CustomDatePicker
              label="Data de Cobertura/Inseminação *"
              value={data.coverageDate}
              onChange={handleCoverageDateChange}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <CustomDatePicker
              label="Data Prevista de Parto *"
              value={data.expectedBirthDate}
              onChange={(date) => setData({ ...data, expectedBirthDate: date })}
              minimumDate={data.coverageDate || undefined}
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

        <TouchableOpacity
          onPress={save}
          disabled={saving}
          className="bg-primary rounded-xl p-4 items-center"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Gestação</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
