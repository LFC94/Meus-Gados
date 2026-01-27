import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ButtonAdd,
  CardEdit,
  IconMapping,
  IconSymbol,
  InfiniteList,
  ProductionCardCompact,
  SegmentedControl,
} from "@/components";
import { DiseaseRecord } from "@/components/disease-record";
import { PregnancyTimeline } from "@/components/pregnancy-timeline";
import { ScreenContainer } from "@/components/screen-container";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [vaccines, setVaccines] = useState<VaccinationRecordWithDetails[]>([]);
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [milkRecords, setMilkRecords] = useState<MilkProductionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [buttonAdd, setbuttonAdd] = useState<string | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Pagination
  const [productionOffset, setProductionOffset] = useState(0);
  const [hasMoreProduction, setHasMoreProduction] = useState(true);
  const [isLoadingMoreProduction, setIsLoadingMoreProduction] = useState(false);

  const [vaccineOffset, setVaccineOffset] = useState(0);
  const [hasMoreVaccines, setHasMoreVaccines] = useState(true);
  const [isLoadingMoreVaccines, setIsLoadingMoreVaccines] = useState(false);

  const [diseaseOffset, setDiseaseOffset] = useState(0);
  const [hasMoreDiseases, setHasMoreDiseases] = useState(true);
  const [isLoadingMoreDiseases, setIsLoadingMoreDiseases] = useState(false);

  const LIMIT = 5;

  useScreenHeader("Detalhes do Animal", undefined, () => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CattleCad", { id })}
      className="w-10 h-10 items-center justify-center mr-2"
      style={{ opacity: 1 }}
    >
      <IconSymbol name="edit" size={20} color={colors.primary} />
    </TouchableOpacity>
  ));

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.all([
        cattleStorage.getById(id),
        vaccinationRecordStorage.getByCattleId(id, LIMIT, 0),
        pregnancyStorage.getByCattleId(id),
        diseaseStorage.getByCattleId(id, LIMIT, 0),
        milkProductionStorage.getByCattleId(id, LIMIT, 0),
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

      setProductionOffset(LIMIT);
      setHasMoreProduction(milkRecordsData.length === LIMIT);

      setVaccineOffset(LIMIT);
      setHasMoreVaccines(vaccinesData.length === LIMIT);

      setDiseaseOffset(LIMIT);
      setHasMoreDiseases(diseasesData.length === LIMIT);
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

  const loadMore = async () => {
    if (loading) return;

    if (activeTab === "production") {
      if (isLoadingMoreProduction || !hasMoreProduction) return;
      try {
        setIsLoadingMoreProduction(true);
        const data = await milkProductionStorage.getByCattleId(id, LIMIT, productionOffset);
        setMilkRecords((prev) => [...prev, ...data]);
        setProductionOffset((prev) => prev + LIMIT);
        setHasMoreProduction(data.length === LIMIT);
      } catch (error) {
        console.error("Error loading more milk records:", error);
      } finally {
        setIsLoadingMoreProduction(false);
      }
    } else if (activeTab === "vaccines") {
      if (isLoadingMoreVaccines || !hasMoreVaccines) return;
      try {
        setIsLoadingMoreVaccines(true);
        const data = await vaccinationRecordStorage.getByCattleId(id, LIMIT, vaccineOffset);
        setVaccines((prev) => [...prev, ...data]);
        setVaccineOffset((prev) => prev + LIMIT);
        setHasMoreVaccines(data.length === LIMIT);
      } catch (error) {
        console.error("Error loading more vaccines:", error);
      } finally {
        setIsLoadingMoreVaccines(false);
      }
    } else if (activeTab === "diseases") {
      if (isLoadingMoreDiseases || !hasMoreDiseases) return;
      try {
        setIsLoadingMoreDiseases(true);
        const data = await diseaseStorage.getByCattleId(id, LIMIT, diseaseOffset);
        setDiseases((prev) => [...prev, ...data]);
        setDiseaseOffset((prev) => prev + LIMIT);
        setHasMoreDiseases(data.length === LIMIT);
      } catch (error) {
        console.error("Error loading more diseases:", error);
      } finally {
        setIsLoadingMoreDiseases(false);
      }
    }
  };

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

  const getStatusBadge = (): CattleResult[] => {
    // Check for disease in treatment
    const inDeath = diseases.find((d) => d.result === "death");
    if (inDeath) {
      return ["death" as CattleResult];
    }

    let result = [] as CattleResult[];
    const activePregnancy = pregnancies.find((p) => p.result === "pending");
    if (activePregnancy) {
      const expectedBirthDate = new Date(activePregnancy.expectedBirthDate);
      const isOverdue = new Date() > expectedBirthDate;
      result.push(isOverdue ? "overdue_pregnancy" : "pregnancy");
    }

    // Check for disease in treatment
    const inTreatment = diseases.find((d) => d.result === "in_treatment");
    if (inTreatment) {
      result.push("in_treatment");
    } else {
      result.push("healthy");
    }

    // Check for pending vaccines
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const hasPendingVaccine = vaccines.some((v) => {
      if (!v.nextDoseDate || v.isNextDoseApplied) return false;
      const nextDoseDate = new Date(v.nextDoseDate);
      return nextDoseDate <= thirtyDaysFromNow;
    });
    if (hasPendingVaccine) {
      result.push("pending_vaccine");
    }

    return result;
  };

  const selecionarTab = async (tab: Tab) => {
    switch (tab) {
      case "vaccines":
        setbuttonAdd("Vacina");
        break;
      case "production":
        setbuttonAdd("Produção");
        break;
      case "pregnancy":
        setbuttonAdd("Gestação");
        break;
      case "diseases":
        setbuttonAdd("Doença");
        break;
      default:
        setbuttonAdd(undefined);
    }
    setActiveTab(tab as Tab);
  };

  const pressButtonAdd = () => {
    switch (activeTab) {
      case "vaccines":
        navigation.navigate("VaccineCad" as never, { cattleId: id } as never);
        break;
      case "production":
        navigation.navigate("MilkProductionCad" as never, { cattleId: id } as never);
        break;
      case "pregnancy":
        navigation.navigate("PregnancyAdd" as never, { cattleId: id } as never);
        break;
      case "diseases":
        navigation.navigate("DiseasesCad" as never, { cattleId: id } as never);
        break;
      default:
        break;
    }
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

  // No statusBadge here, it's used in renderHeader

  const renderHeader = () => {
    if (!cattle) return null;

    return (
      <View className="p-6 gap-4">
        <ConfirmDialog
          visible={showDeleteDialog}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          confirmStyle="destructive"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
        <View className="items-center gap-3">
          <View className="items-center">
            <Text className="text-3xl font-bold text-foreground">{cattle.name || `Animal ${cattle.number}`}</Text>
            <Text className="text-base text-muted mt-1">Nº {cattle.number}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          className="flex-row gap-3 p-4 rounded-2xl justify-center items-center"
          style={{
            flexWrap: "wrap",
          }}
        >
          {getStatusBadge().map((value, index) => {
            const statusBadge = STATUS_CATTLE[value];
            const color = colors[statusBadge.color];
            return (
              <View
                key={index}
                className="flex-row rounded-full items-center gap-2 border px-2 py-1"
                style={{
                  backgroundColor: `${color}20`,
                  borderColor: color,
                }}
              >
                <IconSymbol name={statusBadge.icon} color={color} />
                <Text className="text-base font-semibold" style={{ color: color }}>
                  {statusBadge.text}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Tabs */}
        <SegmentedControl
          options={[
            { label: "Info", value: "info" },
            { label: "Produção", value: "production" },
            { label: "Vacinas", value: "vaccines" },
            { label: "Gestação", value: "pregnancy" },
            { label: "Doenças", value: "diseases" },
          ]}
          tabInit={activeTab}
          onChange={(val: string) => selecionarTab(val as Tab)}
        />
      </View>
    );
  };

  const renderTabContent = () => {
    return (
      <View className="px-6 gap-3">
        <CardEdit
          title="Informações do Animal"
          handleEdit={() => navigation.navigate("CattleCad" as never, { id } as never)}
          handleDelete={() => setShowDeleteDialog(true)}
          small
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
    );
  };

  const getTabData = () => {
    switch (activeTab) {
      case "production":
        return milkRecords;
      case "vaccines":
        return vaccines;
      case "diseases":
        return diseases;
      case "pregnancy":
        return pregnancies;
      default:
        return [1];
    }
  };

  const isLoadingMore =
    activeTab === "production"
      ? isLoadingMoreProduction
      : activeTab === "vaccines"
        ? isLoadingMoreVaccines
        : activeTab === "diseases"
          ? isLoadingMoreDiseases
          : false;

  const hasMore =
    activeTab === "production"
      ? hasMoreProduction
      : activeTab === "vaccines"
        ? hasMoreVaccines
        : activeTab === "diseases"
          ? hasMoreDiseases
          : false;

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "production":
        return "Nenhuma produção registrada";
      case "vaccines":
        return "Nenhuma vacina registrada";
      case "diseases":
        return "Nenhuma doença registrada";
      case "pregnancy":
        return "Nenhuma gestação registrada";
      default:
        return "";
    }
  };
  const getEmptyIcon = (): IconMapping | undefined => {
    switch (activeTab) {
      case "production":
        return "baby-bottle-outline";
      case "vaccines":
        return "vaccines";
      case "diseases":
        return "medical-information";
      case "pregnancy":
        return "baby-buggy-off";
    }
  };

  return (
    <ScreenContainer className="p-0">
      <InfiniteList<any>
        data={getTabData()}
        renderItem={({ item }) => {
          switch (activeTab) {
            case "production":
              return (
                <View className="px-6 mb-3">
                  <ProductionCardCompact milkProduction={item} />
                </View>
              );
            case "vaccines":
              return (
                <View className="px-6 mb-3">
                  <VaccineItem
                    vaccine={item}
                    onEdit={() => navigation.navigate("VaccineCad" as never, { id: item.id } as never)}
                    onDelete={() => handleDeleteVaccine(item.id)}
                  />
                </View>
              );
            case "diseases":
              return (
                <View className="px-6 mb-3">
                  <DiseaseRecord
                    disease={item}
                    onEdit={() => navigation.navigate("DiseasesCad" as never, { id: item.id } as never)}
                    onDelete={() => handleDeleteDisease(item.id)}
                  />
                </View>
              );
            case "pregnancy":
              return (
                <View className="px-6 mb-3">
                  <PregnancyTimeline
                    pregnancy={item}
                    onEdit={() => navigation.navigate("PregnancyEdit" as never, { id: item.id } as never)}
                    onDelete={() => handleDeletePregnancy(item.id)}
                    onCompleteBirth={() => navigation.navigate("PregnancyEdit" as never, { id: item.id } as never)}
                    onCreateCalf={
                      item.result === "success" && !item.calfId
                        ? () => navigation.navigate("PregnancyEdit" as never, { id: item.id } as never)
                        : undefined
                    }
                  />
                </View>
              );
            case "info":
              return renderTabContent();
            default:
              return null;
          }
        }}
        keyExtractor={(item, index) => {
          if (activeTab === "info") return "info-tab";
          return item.id || `item-${index}`;
        }}
        onLoadMore={loadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={loadData}
        refreshing={loading}
        headerComponent={renderHeader()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        emptyMessage={getEmptyMessage()}
        emptyIcon={getEmptyIcon()}
      />
      {buttonAdd && (
        <ButtonAdd label={`Registrar ${buttonAdd}`} color={colors.primary} icon="add" onPress={pressButtonAdd} />
      )}
    </ScreenContainer>
  );
}
