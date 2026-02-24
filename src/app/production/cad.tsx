import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput, FormSelect, LoadingScreen, ScreenContainer } from "@/components";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { useColors, useFormScreen, useScreenHeader } from "@/hooks";
import { logger } from "@/lib/logger";
import { cattleStorage, milkProductionStorage } from "@/lib/storage";
import { Cattle, MilkProductionPeriod, ProductionFormData, RootStackParamList } from "@/types";

export default function MilkProductionCadScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "MilkProductionCad">>();
  const colors = useColors();
  const { id, cattleId } = route.params;
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Produção" : "Registrar Produção");

  const [loadingCattle, setLoadingCattle] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);

  const initialData: ProductionFormData = {
    cattleId: cattleId || "",
    date: new Date(),
    period: "morning",
    quantity: "",
    notes: "",
  };

  const loadCattle = useCallback(async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      logger.error("MilkProductionCad/loadCattle", error);
    } finally {
      setLoadingCattle(false);
    }
  }, []);

  useEffect(() => {
    loadCattle();
  }, [loadCattle]);

  const loadData = useCallback(async () => {
    if (!id) return null;
    const record = await milkProductionStorage.getById(id);
    if (record) {
      return {
        cattleId: record.cattleId,
        date: new Date(record.date),
        period: record.period,
        quantity: record.quantity.toString(),
        notes: record.notes || "",
      };
    }
    return null;
  }, [id]);

  const validate = useCallback((data: ProductionFormData): string | null => {
    if (!data.cattleId) return "Selecione um animal";
    if (!data.date) return "A data da ordenha é obrigatória";
    if (!data.quantity || isNaN(Number(data.quantity.replace(",", ".")))) {
      return "Informe uma quantidade válida";
    }
    return null;
  }, []);

  const onSave = useCallback(
    async (formData: ProductionFormData) => {
      const payload = {
        cattleId: formData.cattleId,
        date: formData.date!.toISOString(),
        period: formData.period,
        quantity: Number(formData.quantity.replace(",", ".")),
        notes: formData.notes.trim() || undefined,
      };

      if (id) {
        await milkProductionStorage.update(id, payload);
      } else {
        await milkProductionStorage.add(payload);
      }
    },
    [id],
  );

  const { data, setData, saving, save } = useFormScreen<ProductionFormData>({
    initialData,
    loadData,
    validate,
    onSave,
  });

  if (loadingCattle) return <LoadingScreen />;

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6 pb-6">
            <FormSelect
              label="Animal"
              value={data.cattleId}
              onValueChange={(value) => setData({ ...data, cattleId: value })}
              options={cattle.map((c) => ({
                label: c.name || `Animal ${c.number}`,
                value: c.id,
              }))}
              placeholder="Selecionar animal"
              required
              disabled={!!id || !!cattleId || saving}
            />

            <CustomDatePicker
              label="Data da Ordenha *"
              value={data.date}
              onChange={(date) => setData({ ...data, date })}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <FormSelect
              label="Período"
              value={data.period}
              onValueChange={(value) => setData({ ...data, period: value as MilkProductionPeriod })}
              options={[
                { label: "Manhã", value: "morning" },
                { label: "Tarde", value: "afternoon" },
                { label: "Dia Todo", value: "full_day" },
              ]}
              required
            />

            <FormInput
              label="Quantidade (Litros)"
              value={data.quantity}
              onChangeText={(text) => setData({ ...data, quantity: text })}
              placeholder="0.00"
              keyboardType="numeric"
              required
            />

            <FormInput
              label="Observações"
              value={data.notes}
              onChangeText={(text) => setData({ ...data, notes: text })}
              placeholder="Observações sobre a ordenha..."
              multiline
              numberOfLines={4}
            />
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
            <Text className="text-background font-semibold text-base">Salvar Registro</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
