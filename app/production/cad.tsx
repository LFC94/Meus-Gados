import { FormInput, FormSelect } from "@/components";
import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { cattleStorage, milkProductionStorage } from "@/lib/storage";
import { Cattle, RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MilkProductionCadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "MilkProductionCad">>();
  const colors = useColors();
  const { id, cattleId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);

  const [formData, setFormData] = useState({
    cattleId: cattleId || "",
    date: new Date(),
    period: "morning" as "morning" | "afternoon" | "full_day",
    quantity: "",
    notes: "",
  });

  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Produção" : "Registrar Produção");

  useEffect(() => {
    loadCattle();
  }, []);

  useEffect(() => {
    if (id) {
      loadProduction();
    }
  }, [id]);

  const loadCattle = async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
    } finally {
      setLoadingCattle(false);
    }
  };

  const loadProduction = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const record = await milkProductionStorage.getById(id);
      if (record) {
        setFormData({
          cattleId: record.cattleId,
          date: new Date(record.date),
          period: record.period,
          quantity: record.quantity.toString(),
          notes: record.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading production:", error);
      Alert.alert("Erro", "Não foi possível carregar o registro");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.cattleId) {
      Alert.alert("Erro", "Selecione um animal");
      return;
    }

    if (!formData.quantity || isNaN(Number(formData.quantity.replace(",", ".")))) {
      Alert.alert("Erro", "Informe uma quantidade válida");
      return;
    }

    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const data = {
        cattleId: formData.cattleId,
        date: formData.date.toISOString(),
        period: formData.period,
        quantity: Number(formData.quantity.replace(",", ".")),
        notes: formData.notes.trim() || undefined,
      };

      if (id) {
        await milkProductionStorage.update(id, data);
      } else {
        await milkProductionStorage.add(data);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Registro salvo com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      Alert.alert("Erro", "Não foi possível salvar o registro");
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
          <View className="gap-6 pb-6">
            <FormSelect
              label="Animal"
              value={formData.cattleId}
              onValueChange={(value) => setFormData({ ...formData, cattleId: value })}
              options={cattle.map((c) => ({ label: c.name || `Animal ${c.number}`, value: c.id }))}
              placeholder="Selecionar animal"
              required
              disabled={!!id || !!cattleId || loading}
            />

            <CustomDatePicker
              label="Data da Ordenha *"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <FormSelect
              label="Período"
              value={formData.period}
              onValueChange={(value) => setFormData({ ...formData, period: value as any })}
              options={[
                { label: "Manhã", value: "morning" },
                { label: "Tarde", value: "afternoon" },
                { label: "Dia Todo", value: "full_day" },
              ]}
              required
            />

            <FormInput
              label="Quantidade (Litros)"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              placeholder="0.00"
              keyboardType="numeric"
              required
            />

            <FormInput
              label="Observações"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Observações sobre a ordenha..."
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary rounded-full p-4 items-center"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Registro</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
