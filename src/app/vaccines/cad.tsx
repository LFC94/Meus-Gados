import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput, FormSelect } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { addDaysToDate } from "@/lib/helpers";
import { scheduleVaccineNotification } from "@/lib/notifications";
import { cattleStorage, vaccinationRecordStorage, vaccineCatalogStorage } from "@/lib/storage";
import { Cattle, RootStackParamList, VaccineModel } from "@/types";

export default function VaccineCadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "VaccineCad">>();
  const colors = useColors();
  const { id, cattleId, previousRecordId, vaccineId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [vaccineCatalog, setVaccineCatalog] = useState<VaccineModel[]>([]);

  const [formData, setFormData] = useState<{
    cattleId: string | undefined;
    vaccineId: string;
    appliedDate: Date | null;
    nextDose: Date | null;
    batchUsed: string;
    notes: string;
  }>({
    cattleId: cattleId,
    vaccineId: vaccineId || "",
    appliedDate: new Date(),
    nextDose: null,
    batchUsed: "",
    notes: "",
  });
  const insets = useSafeAreaInsets();

  useScreenHeader(id ? "Editar Vacina" : "Registrar Vacina");

  const loadCattle = useCallback(async () => {
    try {
      setLoadingCattle(true);
      const data = await cattleStorage.getAll();
      setCattle(data);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
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
      console.error("Erro ao carregar catálogo de vacinas:", error);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const loadVaccine = useCallback(async () => {
    try {
      if (!id) return;

      const vaccination = await vaccinationRecordStorage.getById(id);

      if (vaccination) {
        const vaccine = await vaccineCatalogStorage.getById(vaccination.vaccineId);
        if (!vaccine) {
          return;
        }
        setFormData({
          cattleId: vaccination.cattleId,
          vaccineId: vaccination.vaccineId,
          appliedDate: new Date(vaccination.dateApplied),
          nextDose: vaccination.nextDoseDate ? new Date(vaccination.nextDoseDate) : null,
          batchUsed: vaccination.batchUsed || "",
          notes: vaccination.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading vaccine:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da vacina");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCattle();
    loadVaccineCatalog();
  }, [loadCattle, loadVaccineCatalog]);

  useEffect(() => {
    loadVaccine();
  }, [loadVaccine]);

  const handleSave = async () => {
    if (!formData.cattleId) {
      Alert.alert("Erro", "Selecione um animal");
      return;
    }

    if (!formData.vaccineId) {
      Alert.alert("Erro", "Selecione uma vacina");
      return;
    }

    if (!formData.appliedDate) {
      Alert.alert("Erro", "A data de aplicação é obrigatória");
      return;
    }

    try {
      setLoading(true);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const selectedVaccine = vaccineCatalog.find((v) => v.id === formData.vaccineId);
      const data = {
        cattleId: formData.cattleId,
        vaccineId: formData.vaccineId,
        dateApplied: formData.appliedDate.toISOString(),
        nextDoseDate: formData.nextDose ? formData.nextDose.toISOString() : undefined,
        batchUsed: formData.batchUsed.trim() || selectedVaccine?.batchNumber,
        notes: formData.notes.trim() || undefined,
      };
      if (id) {
        await vaccinationRecordStorage.update(id!, data);
      } else {
        const record = await vaccinationRecordStorage.add(data);

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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Sucesso", "Vacina registrada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao registrar vacina:", error);
      Alert.alert("Erro", "Não foi possível registrar a vacina");
    } finally {
      setLoading(false);
    }
  };

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
              value={formData.cattleId || ""}
              onValueChange={(value) => setFormData({ ...formData, cattleId: value })}
              options={cattle.map((c) => ({ label: c.name || `Animal ${c.number}`, value: c.id }))}
              placeholder="Selecionar animal"
              required
              disabled={!!id || !!cattleId}
            />

            <FormSelect
              label="Vacina"
              value={formData.vaccineId}
              onValueChange={(value) => {
                const selected = vaccineCatalog.find((v) => v.id === value);
                let nextDose = formData.nextDose;

                if (selected?.daysBetweenDoses && formData.appliedDate) {
                  nextDose = addDaysToDate(formData.appliedDate, selected.daysBetweenDoses);
                }

                setFormData({
                  ...formData,
                  vaccineId: value,
                  batchUsed: selected?.batchNumber || "",
                  nextDose,
                });
              }}
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
              value={formData.appliedDate}
              onChange={(date) => {
                const selected = vaccineCatalog.find((v) => v.id === formData.vaccineId);
                let nextDose = formData.nextDose;

                if (date && selected?.daysBetweenDoses) {
                  nextDose = addDaysToDate(date, selected.daysBetweenDoses);
                }

                setFormData({ ...formData, appliedDate: date, nextDose });
              }}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <CustomDatePicker
              label="Próxima Dose"
              value={formData.nextDose}
              onChange={(date) => setFormData({ ...formData, nextDose: date })}
              minimumDate={formData.appliedDate || undefined}
              placeholder="Selecionar data"
            />

            <FormInput
              label="Observações"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Ex: animal apresentou leve reação"
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary rounded-xl p-4 items-center"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Vacina</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
