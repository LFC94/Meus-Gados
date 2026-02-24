import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput, FormSelect, ScreenContainer } from "@/components";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { useColors, useFormScreen, useNavigation, useScreenHeader } from "@/hooks";
import { addDaysToDate } from "@/lib/helpers";
import { logger } from "@/lib/logger";
import { scheduleVaccineNotification } from "@/lib/notifications";
import { cattleStorage, vaccinationRecordStorage, vaccineCatalogStorage } from "@/lib/storage";
import { Cattle, RootStackParamList, VaccineFormData, VaccineModel } from "@/types";

export default function VaccineCadScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "VaccineCad">>();
  const navigation = useNavigation();
  const colors = useColors();
  const { id, cattleId, previousRecordId, vaccineId } = route.params;
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Vacina" : "Registrar Vacina");

  const [loadingCattle, setLoadingCattle] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [vaccineCatalog, setVaccineCatalog] = useState<VaccineModel[]>([]);

  const initialData: VaccineFormData = {
    cattleId: cattleId,
    vaccineId: vaccineId || "",
    appliedDate: new Date(),
    nextDose: null,
    batchUsed: "",
    notes: "",
  };

  const loadCattle = useCallback(async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      logger.error("VaccineCad/loadCattle", error);
    } finally {
      setLoadingCattle(false);
    }
  }, []);

  const loadVaccineCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      const vaccines = await vaccineCatalogStorage.getAll();
      setVaccineCatalog(vaccines);
    } catch (error) {
      logger.error("VaccineCad/loadVaccineCatalog", error);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCattle();
    loadVaccineCatalog();
  }, [loadCattle, loadVaccineCatalog]);

  const loadData = useCallback(async () => {
    if (!id) return null;

    const vaccination = await vaccinationRecordStorage.getById(id);
    if (vaccination) {
      return {
        cattleId: vaccination.cattleId,
        vaccineId: vaccination.vaccineId,
        appliedDate: new Date(vaccination.dateApplied),
        nextDose: vaccination.nextDoseDate ? new Date(vaccination.nextDoseDate) : null,
        batchUsed: vaccination.batchUsed || "",
        notes: vaccination.notes || "",
      };
    }
    return null;
  }, [id]);

  const validate = useCallback((data: VaccineFormData): string | null => {
    if (!data.cattleId) return "Selecione um animal";
    if (!data.vaccineId) return "Selecione uma vacina";
    if (!data.appliedDate) return "A data de aplicação é obrigatória";
    return null;
  }, []);

  const onSave = useCallback(
    async (formData: VaccineFormData) => {
      const selectedVaccine = vaccineCatalog.find((v) => v.id === formData.vaccineId);
      const payload = {
        cattleId: formData.cattleId!,
        vaccineId: formData.vaccineId,
        dateApplied: formData.appliedDate!.toISOString(),
        nextDoseDate: formData.nextDose ? formData.nextDose.toISOString() : undefined,
        batchUsed: formData.batchUsed.trim() || selectedVaccine?.batchNumber,
        notes: formData.notes.trim() || undefined,
      };

      if (id) {
        await vaccinationRecordStorage.update(id, payload);
      } else {
        const record = await vaccinationRecordStorage.add(payload);

        if (previousRecordId) {
          await vaccinationRecordStorage.markNextDoseAsApplied(previousRecordId);
        }

        if (record.nextDoseDate) {
          const selectedCattle = cattle.find((c) => c.id === formData.cattleId);
          if (selectedCattle && selectedVaccine) {
            await scheduleVaccineNotification({
              id: record.id,
              cattleId: record.cattleId,
              vaccineId: record.vaccineId,
              dateApplied: record.dateApplied,
              nextDoseDate: record.nextDoseDate,
              batchUsed: record.batchUsed,
              notes: record.notes,
              vaccineName: selectedVaccine.name,
              cattleName: selectedCattle.name || `Animal ${selectedCattle.number}`,
              createdAt: "",
              updatedAt: "",
            });
          }
        }
      }
    },
    [id, previousRecordId, cattle, vaccineCatalog],
  );

  const { data, setData, saving, save } = useFormScreen<VaccineFormData>({
    initialData,
    loadData,
    validate,
    onSave,
  });

  const handleVaccineSelect = useCallback(
    (value: string) => {
      const selected = vaccineCatalog.find((v) => v.id === value);
      let nextDose = data.nextDose;

      if (selected?.daysBetweenDoses && data.appliedDate) {
        nextDose = addDaysToDate(data.appliedDate, selected.daysBetweenDoses);
      }

      setData({
        ...data,
        vaccineId: value,
        batchUsed: selected?.batchNumber || "",
        nextDose,
      });
    },
    [data, vaccineCatalog, setData],
  );

  const handleAppliedDateChange = useCallback(
    (date: Date | null) => {
      const selected = vaccineCatalog.find((v) => v.id === data.vaccineId);
      let nextDose = data.nextDose;

      if (date && selected?.daysBetweenDoses) {
        nextDose = addDaysToDate(date, selected.daysBetweenDoses);
      }

      setData({ ...data, appliedDate: date, nextDose });
    },
    [data, vaccineCatalog, setData],
  );

  if (loadingCattle || loadingCatalog) {
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

            <FormSelect
              label="Vacina"
              value={data.vaccineId}
              onValueChange={handleVaccineSelect}
              options={vaccineCatalog.map((v) => ({
                label: v.name,
                value: v.id,
              }))}
              placeholder="Selecionar vacina"
              required
            />

            {vaccineCatalog.length === 0 && (
              <View className="px-4 py-2">
                <Text className="text-muted text-center text-sm">
                  Nenhuma vacina no catálogo.{" "}
                  <Text className="text-primary" onPress={() => navigation.navigate("VaccineCatalog" as never)}>
                    Adicionar
                  </Text>
                </Text>
              </View>
            )}

            <CustomDatePicker
              label="Data Aplicada *"
              value={data.appliedDate}
              onChange={handleAppliedDateChange}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <CustomDatePicker
              label="Próxima Dose"
              value={data.nextDose}
              onChange={(date) => setData({ ...data, nextDose: date })}
              minimumDate={data.appliedDate || undefined}
              placeholder="Selecionar data"
            />

            <FormInput
              label="Observações"
              value={data.notes}
              onChangeText={(text) => setData({ ...data, notes: text })}
              placeholder="Ex: animal apresentou leve reação"
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
            <Text className="text-background font-semibold text-base">Salvar Vacina</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
