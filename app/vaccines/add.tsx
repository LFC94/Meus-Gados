import { CustomDatePicker } from "@/components/date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { scheduleVaccineNotification } from "@/lib/notifications";
import { cattleStorage, vaccinationRecordStorage, vaccineCatalogStorage } from "@/lib/storage";
import { Cattle, RootStackParamList, VaccineModel } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddVaccineScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "VaccineAdd">>();
  const colors = useColors();
  const { cattleId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [vaccineCatalog, setVaccineCatalog] = useState<VaccineModel[]>([]);
  const [showCattlePicker, setShowCattlePicker] = useState(false);
  const [showVaccinePicker, setShowVaccinePicker] = useState(false);
  const [formData, setFormData] = useState({
    cattleId: cattleId,
    vaccineId: "",
    appliedDate: new Date(),
    nextDose: new Date(),
    batchUsed: "",
    notes: "",
  });
  const insets = useSafeAreaInsets();

  useScreenHeader("Registrar Vacina");

  useEffect(() => {
    loadCattle();
    loadVaccineCatalog();
  }, []);

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

  const loadVaccineCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const vaccines = await vaccineCatalogStorage.getAll();
      setVaccineCatalog(vaccines);
    } catch (error) {
      console.error("Erro ao carregar catálogo de vacinas:", error);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const getSelectedCattleName = () => {
    const selected = cattle.find((c) => c.id === formData.cattleId);
    return selected ? selected.name || `Animal ${selected.number}` : "Selecionar animal";
  };

  const getSelectedVaccineName = () => {
    const selected = vaccineCatalog.find((v) => v.id === formData.vaccineId);
    return selected ? selected.name : "Selecionar vacina";
  };

  const handleSave = async () => {
    if (!formData.cattleId) {
      Alert.alert("Erro", "Selecione um animal");
      return;
    }

    if (!formData.vaccineId) {
      Alert.alert("Erro", "Selecione uma vacina");
      return;
    }

    try {
      setLoading(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const selectedVaccine = vaccineCatalog.find((v) => v.id === formData.vaccineId);

      const record = await vaccinationRecordStorage.add({
        cattleId: formData.cattleId,
        vaccineId: formData.vaccineId,
        dateApplied: formData.appliedDate.toISOString(),
        nextDoseDate: formData.nextDose ? formData.nextDose.toISOString() : undefined,
        batchUsed: formData.batchUsed.trim() || selectedVaccine?.batchNumber,
        notes: formData.notes.trim() || undefined,
      });

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

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

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

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Vacina *</Text>
              <TouchableOpacity
                onPress={() => setShowVaccinePicker(!showVaccinePicker)}
                className="bg-surface rounded-xl px-4 py-3 border border-border"
                style={{ opacity: 1 }}
              >
                <Text className="text-base" style={{ color: formData.vaccineId ? colors.foreground : colors.muted }}>
                  {getSelectedVaccineName()}
                </Text>
              </TouchableOpacity>

              {showVaccinePicker && (
                <View className="mt-2 bg-surface rounded-xl border border-border overflow-hidden">
                  <ScrollView style={{ maxHeight: 200 }}>
                    {vaccineCatalog.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          setFormData({
                            ...formData,
                            vaccineId: item.id,
                            batchUsed: item.batchNumber || "",
                          });
                          setShowVaccinePicker(false);
                        }}
                        className="px-4 py-3 border-b border-border"
                        style={{ opacity: 1 }}
                      >
                        <Text
                          className="text-base"
                          style={{
                            color: formData.vaccineId === item.id ? colors.primary : colors.foreground,
                            fontWeight: formData.vaccineId === item.id ? "600" : "400",
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {item.manufacturer} • Lote: {item.batchNumber}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {vaccineCatalog.length === 0 && (
                      <View className="px-4 py-4 items-center">
                        <Text className="text-muted text-center">
                          Nenhuma vacina no catálogo.{"\n"}
                          <Text className="text-primary" onPress={() => navigation.navigate("VaccineCatalog" as never)}>
                            Adicionar vacina ao catálogo
                          </Text>
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <CustomDatePicker
              label="Data Aplicada *"
              value={formData.appliedDate}
              onChange={(date) => setFormData({ ...formData, appliedDate: date })}
              maximumDate={new Date()}
              placeholder="Selecionar data"
            />

            <CustomDatePicker
              label="Próxima Dose"
              value={formData.nextDose}
              onChange={(date) => setFormData({ ...formData, nextDose: date })}
              minimumDate={formData.appliedDate}
              placeholder="Selecionar data"
            />

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Lote</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <Text className="text-base text-foreground">{formData.batchUsed || "Lote do catálogo"}</Text>
              </View>
              {formData.batchUsed && formData.vaccineId && (
                <Text className="text-xs text-muted mt-1">Lote preenchido automaticamente do catálogo</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Observações</Text>
              <View className="bg-surface rounded-xl px-4 py-3 border border-border">
                <TextInput
                  placeholder="Ex: animal apresentou leve reação"
                  placeholderTextColor={colors.muted}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  className="text-base text-foreground"
                  style={{ padding: 0, minHeight: 80, textAlignVertical: "top" }}
                  multiline
                />
              </View>
            </View>
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
            <Text className="text-background font-semibold text-base">Salvar Vacina</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
