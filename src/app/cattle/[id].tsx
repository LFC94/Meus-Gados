import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { CardEdit, ProductionCardCompact } from "@/components";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DiseaseRecord } from "@/components/disease-record";
import { IconSymbol } from "@/components/icon-symbol";
import { PregnancyTimeline } from "@/components/pregnancy-timeline";
import { ScreenContainer } from "@/components/screen-container";
import { VaccineItem } from "@/components/vaccine-item";
import { STATUS_CATTLE } from "@/constants/const";
import { useColors, useNavigation, useScreenHeader } from "@/hooks";
import { formatDate, formatWeight } from "@/lib/helpers";
import {
  cattleStorage,
  diseaseStorage,
  milkProductionStorage,
  pregnancyStorage,
  vaccinationRecordStorage,
} from "@/lib/storage";
import {
  Cattle,
  CattleResult,
  Disease,
  MilkProductionRecord,
  Pregnancy,
  RootStackParamList,
  VaccinationRecordWithDetails,
} from "@/types";

type Tab = "info" | "vaccines" | "pregnancy" | "diseases" | "production";

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
  const [milkRecords, setMilkRecords] = useState<MilkProductionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useScreenHeader("Detalhes do Animal", undefined, () => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CattleCad", { id })}
      className="w-10 h-10 items-center justify-center mr-2"
      style={{ opacity: 1 }}
    >
      <IconSymbol name="pencil" size={20} color={colors.primary} />
    </TouchableOpacity>
  ));

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.all([
        cattleStorage.getById(id),
        vaccinationRecordStorage.getByCattleId(id),
        pregnancyStorage.getByCattleId(id),
        diseaseStorage.getByCattleId(id),
        milkProductionStorage.getByCattleId(id),
      ]);

      const cattleData = results[0];
      const vaccinesData = results[1];
      const pregnanciesData = results[2];
      const diseasesData = results[3];
      const milkRecordsData = results[4];

      setCattle(cattleData);
      setVaccines(vaccinesData);
      setPregnancies(pregnanciesData);
      setDiseases(diseasesData);
      setMilkRecords(milkRecordsData);
    } catch (error) {
      console.error("Error loading cattle data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        loadData();
      }
    }, [id, loadData]),
  );

  const handleDelete = async () => {
    try {
      await cattleStorage.delete(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          } catch {
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
          } catch {
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
          } catch {
            Alert.alert("Erro", "Não foi possível excluir a doença");
          }
        },
      },
    ]);
  };

  const getStatusBadge = (): CattleResult => {
    // Check for disease in treatment
    const inDeath = diseases.find((d) => d.result === "death");
    if (inDeath) {
      return "death";
    }

    // Check for active pregnancy
    const activePregnancy = pregnancies.find((p) => p.result === "pending");
    if (activePregnancy) {
      const expectedBirthDate = new Date(activePregnancy.expectedBirthDate);
      const isOverdue = new Date() > expectedBirthDate;
      return isOverdue ? "overdue_pregnancy" : "pregnancy";
    }

    // Check for disease in treatment
    const inTreatment = diseases.find((d) => d.result === "in_treatment");
    if (inTreatment) {
      return "in_treatment";
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
      return "pending_vaccine";
    }

    return "healthy";
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
          className="mt-4 bg-primary rounded-xl px-6 py-3"
          style={{ opacity: 1 }}
        >
          <Text className="text-background font-semibold">Voltar</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const statusBadge = STATUS_CATTLE[getStatusBadge()];

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
              <Text className="text-base">{statusBadge.icon}</Text>
              <Text className="text-base font-semibold" style={{ color: statusBadge.color }}>
                {statusBadge.text}
              </Text>
            </View>
          </View>

          {/* Tabs */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="rounded-md bg-surface border border-border flex-row"
          >
            {[
              { label: "Info", value: "info" },
              { label: "Produção", value: "production" },
              { label: "Vacinas", value: "vaccines" },
              { label: "Gestação", value: "pregnancy" },
              { label: "Doenças", value: "diseases" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveTab(tab.value as Tab)}
                className={`flex py-3 items-center ${activeTab === tab.value ? "bg-primary" : "bg-transparent"} border border-border`}
                style={{ width: 100 }}
              >
                <Text className={`font-bold text-xs ${activeTab === tab.value ? "text-white" : "text-muted"}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tab Content */}
          {activeTab === "info" && (
            <View className="gap-3">
              <Text className="text-base font-semibold text-foreground">Informações do Animal</Text>
              {/* Quick Info */}
              <CardEdit
                handleEdit={() => navigation.navigate("CattleCad" as never, { id } as never)}
                handleDelete={() => setShowDeleteDialog(true)}
              >
                <View className="gap-3">
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
              </CardEdit>
            </View>
          )}

          {activeTab === "vaccines" && (
            <View className="gap-3">
              {vaccines.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-muted text-center mb-4">Nenhuma vacina registrada</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("VaccineCad" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl px-6 py-3"
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
                      onEdit={() => navigation.navigate("VaccineCad" as never, { id: vaccine.id } as never)}
                      onDelete={() => handleDeleteVaccine(vaccine.id)}
                    />
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("VaccineCad" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl p-4 items-center mt-2"
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
                    onPress={() => navigation.navigate("PregnancyAdd" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl px-6 py-3"
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
                    onPress={() => navigation.navigate("PregnancyAdd" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl p-4 items-center mt-2"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Gestação</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {activeTab === "production" && (
            <View className="gap-3">
              {milkRecords.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-muted text-center mb-4">Nenhuma produção registrada</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("MilkProductionCad" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl px-6 py-3"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Produção</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {milkRecords.map((record) => (
                    <ProductionCardCompact key={record.id} milkProduction={record} />
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("MilkProductionCad" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl p-4 items-center mt-2"
                    style={{ opacity: 1 }}
                  >
                    <Text className="text-background font-semibold">+ Registrar Produção</Text>
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
                    onPress={() => navigation.navigate("DiseasesCad" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl px-6 py-3"
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
                      onEdit={() => navigation.navigate("DiseasesCad" as never, { id: disease.id } as never)}
                      onDelete={() => handleDeleteDisease(disease.id)}
                    />
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("DiseasesCad" as never, { cattleId: id } as never)}
                    className="bg-primary rounded-xl p-4 items-center mt-2"
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
