import { ConfirmDialog } from "@/components/confirm-dialog";
import { DiseaseRecord } from "@/components/disease-record";
import { IconSymbol } from "@/components/icon-symbol";
import { PregnancyTimeline } from "@/components/pregnancy-timeline";
import { ScreenContainer } from "@/components/screen-container";
import { VaccineItem } from "@/components/vaccine-item";
import { useColors, useNavigation, useScreenHeader } from "@/hooks";
import { formatDate, formatWeight } from "@/lib/helpers";
import { cattleStorage, diseaseStorage, pregnancyStorage, vaccinationRecordStorage } from "@/lib/storage";
import { Cattle, Disease, Pregnancy, RootStackParamList, VaccinationRecordWithDetails } from "@/types";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Tab = "info" | "vaccines" | "pregnancy" | "diseases";

export default function CattleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "CattleDetail">>();
  const colors = useColors();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [vaccines, setVaccines] = useState<VaccinationRecordWithDetails[]>([]);
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useScreenHeader("Detalhes do Animal", undefined, () => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CattleEdit", { id })}
      className="w-10 h-10 items-center justify-center"
      style={{ opacity: 1 }}
    >
      <IconSymbol name="pencil" size={20} color={colors.primary} />
    </TouchableOpacity>
  ));

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        loadData();
      }
    }, [id])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [cattleData, vaccinesData, pregnanciesData, diseasesData] = await Promise.all([
        cattleStorage.getById(id),
        vaccinationRecordStorage.getByCattleId(id),
        pregnancyStorage.getByCattleId(id),
        diseaseStorage.getByCattleId(id),
      ]);

      setCattle(cattleData);
      setVaccines(vaccinesData);
      setPregnancies(pregnanciesData);
      setDiseases(diseasesData);
    } catch (error) {
      console.error("Error loading cattle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await cattleStorage.delete(id);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Sucesso", "Animal excluído com sucesso", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o animal");
      console.error("Não foi possível excluir o animal", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteVaccine = (vaccineId: string) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir esta vacina?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await vaccinationRecordStorage.delete(vaccineId);
            loadData();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a vacina");
          }
        },
      },
    ]);
  };

  const handleDeletePregnancy = (pregnancyId: string) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este registro de gestação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await pregnancyStorage.delete(pregnancyId);
            loadData();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a gestação");
          }
        },
      },
    ]);
  };

  const handleDeleteDisease = (diseaseId: string) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este registro de doença?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await diseaseStorage.delete(diseaseId);
            loadData();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a doença");
          }
        },
      },
    ]);
  };

  const getStatusBadge = () => {
    // Check for active pregnancy
    const activePregnancy = pregnancies.find((p) => p.result === "pending");
    if (activePregnancy) {
      const expectedBirthDate = new Date(activePregnancy.expectedBirthDate);
      const isOverdue = new Date() > expectedBirthDate;
      return {
        color: isOverdue ? "#EF4444" : "#22C55E",
        text: isOverdue ? "Gestação Atrasada" : "Gestante",
      };
    }

    // Check for disease in treatment
    const inTreatment = diseases.find((d) => d.result === "in_treatment");
    if (inTreatment) {
      return { color: "#F59E0B", text: "Em Tratamento" };
    }

    // Check for pending vaccines
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const hasPendingVaccine = vaccines.some((v) => {
      if (!v.nextDoseDate) return false;
      const nextDoseDate = new Date(v.nextDoseDate);
      return nextDoseDate <= thirtyDaysFromNow;
    });
    if (hasPendingVaccine) {
      return { color: "#F59E0B", text: "Vacina Pendente" };
    }

    return { color: "#22C55E", text: "Saudável" };
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!cattle) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-muted text-center">Animal não encontrado</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-primary rounded-full px-6 py-3"
          style={{ opacity: 1 }}
        >
          <Text className="text-background font-semibold">Voltar</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const statusBadge = getStatusBadge();

  return (
    <ScreenContainer className="p-0">
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        confirmStyle="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Animal Info Card */}
        <View className="p-6 gap-4">
          {/* Icon and Name */}
          <View className="items-center gap-3">
            <Text className="text-5xl">🐄</Text>
            <View className="items-center">
              <Text className="text-3xl font-bold text-foreground">{cattle.name || `Animal ${cattle.number}`}</Text>
              <Text className="text-base text-muted mt-1">Nº {cattle.number}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className="bg-surface rounded-2xl p-4 border border-border items-center">
            <View className="flex-row items-center gap-2">
              <View className="w-3 h-3 rounded-full" style={{ backgroundColor: statusBadge.color }} />
              <Text className="text-base font-semibold" style={{ color: statusBadge.color }}>
                {statusBadge.text}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={() => setActiveTab("info")}
              className="flex-1 py-3 rounded-xl items-center border"
              style={{
                backgroundColor: activeTab === "info" ? colors.primary : colors.surface,
                borderColor: activeTab === "info" ? colors.primary : colors.border,
                opacity: 1,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: activeTab === "info" ? colors.background : colors.foreground }}
              >
                Infos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("vaccines")}
              className="flex-1 py-3 rounded-xl items-center border"
              style={{
                backgroundColor: activeTab === "vaccines" ? colors.primary : colors.surface,
                borderColor: activeTab === "vaccines" ? colors.primary : colors.border,
                opacity: 1,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color: activeTab === "vaccines" ? colors.background : colors.foreground,
                }}
              >
                Vacinas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("pregnancy")}
              className="flex-1 py-3 rounded-xl items-center border"
              style={{
                backgroundColor: activeTab === "pregnancy" ? colors.primary : colors.surface,
                borderColor: activeTab === "pregnancy" ? colors.primary : colors.border,
                opacity: 1,
              }}
            >
              <Text
                className="font-semibold text-xs"
                style={{
                  color: activeTab === "pregnancy" ? colors.background : colors.foreground,
                }}
              >
                Gestação
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("diseases")}
              className="flex-1 py-3 rounded-xl items-center border"
              style={{
                backgroundColor: activeTab === "diseases" ? colors.primary : colors.surface,
                borderColor: activeTab === "diseases" ? colors.primary : colors.border,
                opacity: 1,
              }}
            >
              <Text
                className="font-semibold text-xs"
                style={{
                  color: activeTab === "diseases" ? colors.background : colors.foreground,
                }}
              >
                Doenças
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "info" && (
            <View className="gap-3">
              <Text className="text-base font-semibold text-foreground">Informações do Animal</Text>
              {/* Quick Info */}
              <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Raça</Text>
                  <Text className="text-sm font-semibold text-foreground">{cattle.breed}</Text>
                </View>
                <View className="h-px bg-border" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Data de Nascimento</Text>
                  <Text className="text-sm font-semibold text-foreground">{formatDate(cattle.birthDate)}</Text>
                </View>
                <View className="h-px bg-border" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Peso</Text>
                  <Text className="text-sm font-semibold text-foreground">{formatWeight(cattle.weight)}</Text>
                </View>
                {cattle.motherId && (
                  <>
                    <View className="h-px bg-border" />
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-muted">Mãe</Text>
                      <Text className="text-sm font-semibold text-primary">Cadastrada</Text>
                    </View>
                  </>
                )}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("CattleEdit" as never, { id } as never)}
                className="bg-surface rounded-2xl p-4 border border-border flex-row items-center"
                style={{ opacity: 1 }}
              >
                <IconSymbol name="pencil" size={20} color={colors.muted} />
                <Text className="text-foreground font-semibold px-2">Editar Informações</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDeleteDialog(true)}
                className="bg-surface rounded-2xl p-4 border border-error flex-row items-center"
                style={{ opacity: 1 }}
              >
                <IconSymbol name="trash" size={20} color="#EF4444" />
                <Text className="text-error font-semibold px-2">Excluir Animal</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "vaccines" && (
            <View className="gap-3">
              {vaccines.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-muted text-center mb-4">Nenhuma vacina registrada</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("VaccineAdd" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-full px-6 py-3"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Adicionar Vacina</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {vaccines.map((vaccine) => (
                    <VaccineItem
                      key={vaccine.id}
                      vaccine={vaccine}
                      onEdit={() => navigation.navigate("VaccineEdit" as never, { id: vaccine.id } as never)}
                      onDelete={() => handleDeleteVaccine(vaccine.id)}
                    />
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("VaccineAdd" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-full p-4 items-center mt-2"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Adicionar Vacina</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {activeTab === "pregnancy" && (
            <View className="gap-3">
              {pregnancies.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-muted text-center mb-4">Nenhuma gestação registrada</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PregnancyAdd" as never)}
                    className="bg-primary rounded-full px-6 py-3"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Gestação</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {pregnancies.map((pregnancy) => (
                    <PregnancyTimeline
                      key={pregnancy.id}
                      pregnancy={pregnancy}
                      onEdit={() => navigation.navigate("PregnancyEdit" as never, { id: pregnancy.id } as never)}
                      onDelete={() => handleDeletePregnancy(pregnancy.id)}
                      onCompleteBirth={() =>
                        navigation.navigate("PregnancyEdit" as never, { id: pregnancy.id } as never)
                      }
                      onCreateCalf={
                        pregnancy.result === "success" && !pregnancy.calfId
                          ? () => navigation.navigate("PregnancyEdit" as never, { id: pregnancy.id } as never)
                          : undefined
                      }
                    />
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PregnancyAdd" as never)}
                    className="bg-primary rounded-full p-4 items-center mt-2"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Gestação</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {activeTab === "diseases" && (
            <View className="gap-3">
              {diseases.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-muted text-center mb-4">Nenhuma doença registrada</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("DiseasesAdd")}
                    className="bg-primary rounded-full px-6 py-3"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Doença</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {diseases.map((disease) => (
                    <DiseaseRecord
                      key={disease.id}
                      disease={disease}
                      onEdit={() => navigation.navigate("DiseasesEdit", { id: disease.id } as never)}
                      onDelete={() => handleDeleteDisease(disease.id)}
                    />
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("DiseasesAdd" as never)}
                    className="bg-primary rounded-full p-4 items-center mt-2"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Doença</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
