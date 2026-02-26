import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useCallback, useReducer } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ButtonAdd,
  CardEdit,
  IconMapping,
  IconSymbol,
  InfiniteList,
  LoadingScreen,
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
import { logger } from "@/lib/logger";
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

interface PaginationState {
  offset: number;
  hasMore: boolean;
  loading: boolean;
}

interface CattleDetailState {
  loading: boolean;
  cattle: Cattle | null;
  vaccines: VaccinationRecordWithDetails[];
  pregnancies: Pregnancy[];
  diseases: Disease[];
  milkRecords: MilkProductionRecord[];
  activeTab: Tab;
  buttonAdd: string | undefined;
  showDeleteDialog: boolean;
  pagination: {
    production: PaginationState;
    vaccines: PaginationState;
    diseases: PaginationState;
  };
}

type CattleDetailAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CATTLE"; payload: Cattle | null }
  | { type: "SET_VACCINES"; payload: VaccinationRecordWithDetails[] }
  | { type: "SET_PREGNANCIES"; payload: Pregnancy[] }
  | { type: "SET_DISEASES"; payload: Disease[] }
  | { type: "SET_MILK_RECORDS"; payload: MilkProductionRecord[] }
  | { type: "SET_TAB"; payload: Tab }
  | { type: "SET_BUTTON_ADD"; payload: string | undefined }
  | { type: "SET_DELETE_DIALOG"; payload: boolean }
  | {
      type: "APPEND_MILK_RECORDS";
      payload: { records: MilkProductionRecord[]; hasMore: boolean };
    }
  | {
      type: "APPEND_VACCINES";
      payload: { records: VaccinationRecordWithDetails[]; hasMore: boolean };
    }
  | {
      type: "APPEND_DISEASES";
      payload: { records: Disease[]; hasMore: boolean };
    }
  | { type: "RESET_PAGINATION"; payload: Tab };

const initialPaginationState: PaginationState = {
  offset: 5,
  hasMore: true,
  loading: false,
};

const initialState: CattleDetailState = {
  loading: true,
  cattle: null,
  vaccines: [],
  pregnancies: [],
  diseases: [],
  milkRecords: [],
  activeTab: "info",
  buttonAdd: undefined,
  showDeleteDialog: false,
  pagination: {
    production: { ...initialPaginationState },
    vaccines: { ...initialPaginationState },
    diseases: { ...initialPaginationState },
  },
};

function cattleDetailReducer(state: CattleDetailState, action: CattleDetailAction): CattleDetailState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CATTLE":
      return { ...state, cattle: action.payload };
    case "SET_VACCINES":
      return { ...state, vaccines: action.payload };
    case "SET_PREGNANCIES":
      return { ...state, pregnancies: action.payload };
    case "SET_DISEASES":
      return { ...state, diseases: action.payload };
    case "SET_MILK_RECORDS":
      return { ...state, milkRecords: action.payload };
    case "SET_TAB": {
      const tab = action.payload;
      let buttonAdd: string | undefined;
      switch (tab) {
        case "vaccines":
          buttonAdd = "Vacina";
          break;
        case "production":
          buttonAdd = "Produção";
          break;
        case "pregnancy":
          buttonAdd = "Gestação";
          break;
        case "diseases":
          buttonAdd = "Doença";
          break;
        default:
          buttonAdd = undefined;
      }
      return { ...state, activeTab: tab, buttonAdd };
    }
    case "SET_BUTTON_ADD":
      return { ...state, buttonAdd: action.payload };
    case "SET_DELETE_DIALOG":
      return { ...state, showDeleteDialog: action.payload };
    case "APPEND_MILK_RECORDS":
      return {
        ...state,
        milkRecords: [...state.milkRecords, ...action.payload.records],
        pagination: {
          ...state.pagination,
          production: {
            offset: state.pagination.production.offset + action.payload.records.length,
            hasMore: action.payload.hasMore,
            loading: false,
          },
        },
      };
    case "APPEND_VACCINES":
      return {
        ...state,
        vaccines: [...state.vaccines, ...action.payload.records],
        pagination: {
          ...state.pagination,
          vaccines: {
            offset: state.pagination.vaccines.offset + action.payload.records.length,
            hasMore: action.payload.hasMore,
            loading: false,
          },
        },
      };
    case "APPEND_DISEASES":
      return {
        ...state,
        diseases: [...state.diseases, ...action.payload.records],
        pagination: {
          ...state.pagination,
          diseases: {
            offset: state.pagination.diseases.offset + action.payload.records.length,
            hasMore: action.payload.hasMore,
            loading: false,
          },
        },
      };
    case "RESET_PAGINATION": {
      const tab = action.payload;
      const newPagination = { ...state.pagination };
      if (tab === "production") newPagination.production = { ...initialPaginationState };
      if (tab === "vaccines") newPagination.vaccines = { ...initialPaginationState };
      if (tab === "diseases") newPagination.diseases = { ...initialPaginationState };
      return { ...state, pagination: newPagination };
    }
    default:
      return state;
  }
}

const LIMIT = 5;

export default function CattleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "CattleDetail">>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [state, dispatch] = useReducer(cattleDetailReducer, initialState);

  const {
    loading,
    cattle,
    vaccines,
    pregnancies,
    diseases,
    milkRecords,
    activeTab,
    buttonAdd,
    showDeleteDialog,
    pagination,
  } = state;

  const loadData = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const results = await Promise.all([
        cattleStorage.getById(id),
        vaccinationRecordStorage.getByCattleId(id, LIMIT, 0),
        pregnancyStorage.getByCattleId(id),
        diseaseStorage.getByCattleId(id, LIMIT, 0),
        milkProductionStorage.getByCattleId(id, LIMIT, 0),
      ]);

      dispatch({ type: "SET_CATTLE", payload: results[0] });
      dispatch({ type: "SET_VACCINES", payload: results[1] });
      dispatch({ type: "SET_PREGNANCIES", payload: results[2] });
      dispatch({ type: "SET_DISEASES", payload: results[3] });
      dispatch({ type: "SET_MILK_RECORDS", payload: results[4] });
    } catch (error) {
      logger.error("CattleDetail/loadData", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadData();
      }
    }, [id, loadData]),
  );

  const loadMore = async () => {
    if (loading) return;

    if (activeTab === "production") {
      if (pagination.production.loading || !pagination.production.hasMore) return;
      try {
        dispatch({
          type: "RESET_PAGINATION",
          payload: "production",
        });
        const data = await milkProductionStorage.getByCattleId(id, LIMIT, pagination.production.offset);
        dispatch({
          type: "APPEND_MILK_RECORDS",
          payload: { records: data, hasMore: data.length === LIMIT },
        });
      } catch (error) {
        logger.error("CattleDetail/loadMoreMilkRecords", error);
      }
    } else if (activeTab === "vaccines") {
      if (pagination.vaccines.loading || !pagination.vaccines.hasMore) return;
      try {
        dispatch({
          type: "RESET_PAGINATION",
          payload: "vaccines",
        });
        const data = await vaccinationRecordStorage.getByCattleId(id, LIMIT, pagination.vaccines.offset);
        dispatch({
          type: "APPEND_VACCINES",
          payload: { records: data, hasMore: data.length === LIMIT },
        });
      } catch (error) {
        logger.error("CattleDetail/loadMoreVaccines", error);
      }
    } else if (activeTab === "diseases") {
      if (pagination.diseases.loading || !pagination.diseases.hasMore) return;
      try {
        dispatch({
          type: "RESET_PAGINATION",
          payload: "diseases",
        });
        const data = await diseaseStorage.getByCattleId(id, LIMIT, pagination.diseases.offset);
        dispatch({
          type: "APPEND_DISEASES",
          payload: { records: data, hasMore: data.length === LIMIT },
        });
      } catch (error) {
        logger.error("CattleDetail/loadMoreDiseases", error);
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
      logger.error("CattleDetail/delete", error);
    } finally {
      dispatch({ type: "SET_DELETE_DIALOG", payload: false });
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

    const inTreatment = diseases.find((d) => d.result === "in_treatment");
    if (inTreatment) {
      result.push("in_treatment");
    } else {
      result.push("healthy");
    }

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

  const selecionarTab = (tab: Tab) => {
    dispatch({ type: "SET_TAB", payload: tab });
  };

  const pressButtonAdd = () => {
    switch (activeTab) {
      case "vaccines":
        navigation.navigate("VaccineCad", { cattleId: id });
        break;
      case "production":
        navigation.navigate("MilkProductionCad", { cattleId: id });
        break;
      case "pregnancy":
        navigation.navigate("PregnancyAdd", { cattleId: id });
        break;
      case "diseases":
        navigation.navigate("DiseasesCad", { cattleId: id });
        break;
      default:
        break;
    }
  };

  useScreenHeader("Detalhes do Animal", undefined, () => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CattleCad", { id })}
      className="w-10 h-10 items-center justify-center mr-2"
      style={{ opacity: 1 }}
    >
      <IconSymbol name="edit" size={20} color={colors.primary} />
    </TouchableOpacity>
  ));

  if (loading) return <LoadingScreen />;

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

  const renderHeader = () => {
    return (
      <View className="p-6 gap-4">
        <ConfirmDialog
          visible={showDeleteDialog}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          confirmStyle="destructive"
          onConfirm={handleDelete}
          onCancel={() => dispatch({ type: "SET_DELETE_DIALOG", payload: false })}
        />
        <View className="items-center gap-3">
          <View className="items-center">
            <Text className="text-3xl font-bold text-foreground">{cattle.name || `Animal ${cattle.number}`}</Text>
            <Text className="text-base text-muted mt-1">Nº {cattle.number}</Text>
          </View>
        </View>

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
          handleEdit={() => navigation.navigate("CattleCad", { id })}
          handleDelete={() => dispatch({ type: "SET_DELETE_DIALOG", payload: true })}
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

  const getCurrentPagination = () => {
    if (activeTab === "production") return pagination.production;
    if (activeTab === "vaccines") return pagination.vaccines;
    if (activeTab === "diseases") return pagination.diseases;
    return { offset: 0, hasMore: false, loading: false };
  };

  const currentPagination = getCurrentPagination();
  const isLoadingMore = currentPagination.loading;
  const hasMore = currentPagination.hasMore;

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
      <InfiniteList<unknown>
        data={getTabData()}
        renderItem={({ item }) => {
          switch (activeTab) {
            case "production":
              return (
                <View className="px-6 mb-3">
                  <ProductionCardCompact milkProduction={item as MilkProductionRecord} />
                </View>
              );
            case "vaccines":
              return (
                <View className="px-6 mb-3">
                  <VaccineItem
                    vaccine={item as VaccinationRecordWithDetails}
                    onEdit={() =>
                      navigation.navigate("VaccineCad", {
                        id: (item as VaccinationRecordWithDetails).id,
                      })
                    }
                    onDelete={() => handleDeleteVaccine((item as VaccinationRecordWithDetails).id)}
                  />
                </View>
              );
            case "diseases":
              return (
                <View className="px-6 mb-3">
                  <DiseaseRecord
                    disease={item as Disease}
                    onEdit={() => navigation.navigate("DiseasesCad", { id: (item as Disease).id })}
                    onDelete={() => handleDeleteDisease((item as Disease).id)}
                  />
                </View>
              );
            case "pregnancy":
              return (
                <View className="px-6 mb-3">
                  <PregnancyTimeline
                    pregnancy={item as Pregnancy}
                    onEdit={() => navigation.navigate("PregnancyEdit", { id: (item as Pregnancy).id })}
                    onDelete={() => handleDeletePregnancy((item as Pregnancy).id)}
                    onCompleteBirth={() => navigation.navigate("PregnancyEdit", { id: (item as Pregnancy).id })}
                    onCreateCalf={
                      (item as Pregnancy).result === "success" && !(item as Pregnancy).calfId
                        ? () => navigation.navigate("PregnancyEdit", { id: (item as Pregnancy).id })
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
          return (item as { id?: string }).id || `item-${index}`;
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
