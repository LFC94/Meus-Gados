import { RouteProp, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { useNavigation, useScreenHeader } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { logger } from "@/lib/logger";
import { cattleStorage, pregnancyStorage } from "@/lib/storage";
import { Cattle, PregnancyResult, RootStackParamList } from "@/types";

export default function EditPregnancyScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "PregnancyEdit">>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingCalf, setCreatingCalf] = useState(false);
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [formData, setFormData] = useState<{
    coverageDate: Date | null;
    expectedBirthDate: Date | null;
    actualBirthDate: Date | null;
    result: PregnancyResult;
    complications: string;
  }>({
    coverageDate: new Date(),
    expectedBirthDate: new Date(),
    actualBirthDate: null,
    result: "pending" as PregnancyResult,
    complications: "",
  });

  useScreenHeader("Editar Gestação", `Animal: ${cattle?.name || `Animal ${cattle?.number}`}`);

  const loadPregnancy = useCallback(async () => {
    try {
      if (!id) return;
      const pregnancyData = await pregnancyStorage.getById(id);
      if (pregnancyData) {
        setPregnancy(pregnancyData);
        setFormData({
          coverageDate: new Date(pregnancyData.coverageDate),
          expectedBirthDate: new Date(pregnancyData.expectedBirthDate),
          actualBirthDate: pregnancyData.actualBirthDate ? new Date(pregnancyData.actualBirthDate) : null,
          result: pregnancyData.result || "pending",
          complications: pregnancyData.complications || "",
        });

        // Load cattle info
        const cattleData = await cattleStorage.getById(pregnancyData.cattleId);
        setCattle(cattleData);
      }
    } catch (error) {
      logger.error("PregnancyEdit/loadPregnancy", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da gestação");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPregnancy();
  }, [loadPregnancy]);

  const handleSave = async () => {
    if (!formData.coverageDate) {
      Alert.alert("Erro", "A data de cobertura é obrigatória");
      return;
    }

    if (!formData.expectedBirthDate) {
      Alert.alert("Erro", "A data prevista de parto é obrigatória");
      return;
    }

    try {
      setSaving(true);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await pregnancyStorage.update(id!, {
        coverageDate: formData.coverageDate.toISOString(),
        expectedBirthDate: formData.expectedBirthDate.toISOString(),
        actualBirthDate: formData.actualBirthDate?.toISOString(),
        result: formData.result,
        complications: formData.complications,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Sucesso", "Gestação atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      logger.error("PregnancyEdit/save", error);
      Alert.alert("Erro", "Não foi possível atualizar a gestação");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCalf = async () => {
    if (!cattle || !pregnancy) return;

    Alert.alert(
      "Cadastrar Bezerro",
      `Deseja criar um novo registro para o bezerro de ${cattle.name || `Animal ${cattle.number}`}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cadastrar",
          style: "default",
          onPress: async () => {
            try {
              setCreatingCalf(true);

              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              // Create new calf
              const calfNumber = `${cattle.number}-${Date.now().toString().slice(-3)}`;
              const calf = await cattleStorage.add({
                number: calfNumber,
                name: undefined,
                breed: cattle.breed,
                birthDate: (formData.actualBirthDate || new Date()).toISOString(),
                weight: 35, // Default weight for newborn calf
                motherId: cattle.id,
              });

              // Update pregnancy with calf reference
              await pregnancyStorage.update(id!, {
                calfId: calf.id,
              });

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              Alert.alert("Sucesso", `Bezerro cadastrado com sucesso! Número: ${calfNumber}`, [
                {
                  text: "Ver Bezerro",
                  onPress: () => navigation.navigate("CattleDetail" as never, { id: calf.id } as never),
                },
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              logger.error("PregnancyEdit/createCalf", error);
              Alert.alert("Erro", "Não foi possível cadastrar o bezerro");
            } finally {
              setCreatingCalf(false);
            }
          },
        },
      ],
    );
  };

  const handleResultChange = async (result: PregnancyResult) => {
    setFormData({ ...formData, result });

    // If marking as success or failed, ask if actual birth date should be set to today
    if (result !== "pending") {
      Alert.alert("Data do Parto", "Deseja usar a data de hoje como data do parto?", [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "default",
          onPress: () => {
            setFormData((prev) => ({
              ...prev,
              actualBirthDate: new Date(),
              result,
            }));
          },
        },
      ]);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <View className="flex-1 gap-4" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6 p-4">
            {/* Current Status */}
            {pregnancy && (
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-sm font-medium text-muted mb-2">Status Atual</Text>
                <Text className="text-base font-semibold text-foreground">
                  {formData.result === "pending"
                    ? "Aguardando Parto"
                    : formData.result === "success"
                      ? "Parto com Sucesso"
                      : formData.result === "complications"
                        ? "Parto com Complicações"
                        : "Gestação Perdida"}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View className="gap-4">
              {/* Data de Cobertura */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Data de Cobertura/Inseminação *</Text>
                <CustomDatePicker
                  value={formData.coverageDate}
                  onChange={(date) => setFormData({ ...formData, coverageDate: date })}
                  maximumDate={new Date()}
                  disabled={saving}
                />
              </View>

              {/* Data Prevista de Parto */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Data Prevista de Parto *</Text>
                <CustomDatePicker
                  value={formData.expectedBirthDate}
                  onChange={(date) => setFormData({ ...formData, expectedBirthDate: date })}
                  minimumDate={formData.coverageDate || undefined}
                  disabled={saving}
                />
              </View>

              {/* Resultado do Parto */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Resultado do Parto</Text>
                <View className="gap-2">
                  <TouchableOpacity
                    onPress={() => handleResultChange("pending")}
                    className={`p-3 rounded-lg border-2 bg-primary/10 ${
                      formData.result === "pending" ? "border-primary" : "border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${formData.result === "pending" ? "text-primary" : "text-foreground"}`}
                    >
                      Aguardando Parto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleResultChange("success")}
                    className={`p-3 rounded-lg border-2 ${
                      formData.result === "success" ? "border-success bg-success/10" : "border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${formData.result === "success" ? "text-success" : "text-foreground"}`}
                    >
                      Sucesso - Parto Normal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleResultChange("complications")}
                    className={`p-3 rounded-lg border-2 ${
                      formData.result === "complications" ? "border-warning bg-warning/10" : "border-border"
                    }`}
                    style={{ opacity: 1 }}
                  >
                    <Text
                      className={`font-semibold ${
                        formData.result === "complications" ? "text-warning" : "text-foreground"
                      }`}
                    >
                      Complicações no Parto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleResultChange("failed")}
                    className={`p-3 rounded-lg border-2 ${
                      formData.result === "failed" ? "border-error bg-error/10" : "border-border"
                    }`}
                    style={{ opacity: 1 }}
                  >
                    <Text
                      className={`font-semibold ${formData.result === "failed" ? "text-error" : "text-foreground"}`}
                    >
                      Falha - Gestação Perdida
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Data Real do Parto */}
              {formData.result !== "pending" && (
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Data do Parto</Text>
                  <CustomDatePicker
                    value={formData.actualBirthDate || new Date()}
                    onChange={(date) => setFormData({ ...formData, actualBirthDate: date })}
                    maximumDate={new Date()}
                    disabled={saving}
                  />
                </View>
              )}

              {/* Complicações */}
              {formData.result === "complications" && (
                <FormInput
                  label="Descrição das Complicações"
                  value={formData.complications}
                  onChangeText={(text) => setFormData({ ...formData, complications: text })}
                  placeholder="Descreva as complicações ocorridas durante o parto..."
                  multiline
                  numberOfLines={4}
                />
              )}
            </View>

            {/* Create Calf Button */}
            {formData.result === "success" && !pregnancy?.calfId && (
              <TouchableOpacity
                onPress={handleCreateCalf}
                disabled={creatingCalf}
                className="bg-success rounded-lg p-4 items-center"
                style={{ opacity: creatingCalf ? 0.6 : 1 }}
              >
                {creatingCalf ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">Cadastrar Bezerro Nascimento</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        {/* Buttons */}
        <View className="gap-3 mt-6">
          <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary rounded-lg p-4 items-center">
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Salvar Alterações</Text>
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
    </ScreenContainer>
  );
}
