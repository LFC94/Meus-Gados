import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { calculateExpectedBirthDateAsDate } from "@/lib/helpers";
import { schedulePregnancyNotification } from "@/lib/notifications";
import { cattleStorage, pregnancyStorage } from "@/lib/storage";
import { Cattle } from "@/types";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AddPregnancyScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [showCattlePicker, setShowCattlePicker] = useState(false);
  const [formData, setFormData] = useState({
    cattleId: "",
    coverageDate: new Date(),
    expectedBirthDate: new Date(),
  });

  useEffect(() => {
    loadCattle();
  }, []);

  useEffect(() => {
    if (formData.coverageDate) {
      const expected = calculateExpectedBirthDateAsDate(formData.coverageDate);
      setFormData((prev) => ({
        ...prev,
        expectedBirthDate: expected,
      }));
    }
  }, [formData.coverageDate]);

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

    try {
      setLoading(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

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

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

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
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Registrar Gestação</Text>
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
              <Text className="text-sm font-medium text-foreground mb-2">Animal (Vaca) *</Text>
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
            {/* Data de Cobertura/Inseminação */}
            <CustomDatePicker
              label="Data de Cobertura/Inseminação *"
              value={formData.coverageDate}
              onChange={(date) => {
                setFormData({
                  ...formData,
                  coverageDate: date,
                  expectedBirthDate: calculateExpectedBirthDateAsDate(date),
                });
              }}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            {/* Data Prevista de Parto */}
            <CustomDatePicker
              label="Data Prevista de Parto *"
              value={formData.expectedBirthDate}
              onChange={(date) => setFormData({ ...formData, expectedBirthDate: date })}
              minimumDate={formData.coverageDate}
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
