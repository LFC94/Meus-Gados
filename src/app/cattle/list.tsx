import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { LayoutAnimation, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ButtonAdd, CattleCard, FormSelect, IconSymbol, LoadingScreen } from "@/components/";
import { ScreenContainer } from "@/components/screen-container";
import { STATUS_CATTLE } from "@/constants/const";
import { useCattleFilter } from "@/hooks/use-cattle-filter";
import { useColors } from "@/hooks/use-colors";
import useNavigation from "@/hooks/use-navigation";
import useScreenHeader from "@/hooks/use-screen-header";
import { logger } from "@/lib/logger";
import { cattleStorage, diseaseStorage, pregnancyStorage, vaccinationRecordStorage } from "@/lib/storage";
import { Cattle, CattleResult, Disease, Pregnancy, RootStackParamList, VaccinationRecord } from "@/types";

export default function CattleListScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "CattleList">>();
  const navigation = useNavigation();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing] = useState(false);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [vaccines, setVaccines] = useState<VaccinationRecord[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const {
    filteredCattle,
    breeds,
    statusFilter,
    breedFilter,
    ageRange,
    searchQuery,
    setSearchQuery,
    setStatusFilter,
    setBreedFilter,
    setAgeRange,
    clearFilters,
    getStatus,
  } = useCattleFilter(cattle, diseases, pregnancies, vaccines, route.params?.status);

  useScreenHeader("Meu Rebanho", `${cattle.length} ${cattle.length === 1 ? "animal" : "animais"} cadastrados`);

  useEffect(() => {
    if (route.params?.status) {
      setStatusFilter(route.params.status);
      setShowFilters(true);
    }
  }, [route.params?.status, setStatusFilter]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [cattleData, pregnanciesData, diseasesData, vaccinesData] = await Promise.all([
        cattleStorage.getAll(),
        pregnancyStorage.getAll(),
        diseaseStorage.getAll(),
        vaccinationRecordStorage.getAll(),
      ]);
      const sorted = [...cattleData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCattle(sorted);
      setPregnancies(pregnanciesData);
      setDiseases(diseasesData);
      setVaccines(vaccinesData);
    } catch (error) {
      logger.error("CattleList/loadData", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-6 gap-4 flex-1" style={{ marginBottom: insets.bottom }}>
          {/* Search and Filters Toggle */}
          <View className="rounded-xl p-2 border border-border gap-4">
            <View className="flex-row gap-2">
              <View className="flex-1 bg-surface rounded-xl px-4 border border-border flex-row items-center">
                <IconSymbol name="search" size={20} color={colors.muted} />
                <TextInput
                  placeholder="Buscar por número, nome..."
                  placeholderTextColor={colors.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-base text-foreground ml-2 py-2"
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowFilters(!showFilters);
                }}
                className={`p-3 rounded-xl border ${showFilters ? "bg-primary border-primary" : "bg-surface border-border"}`}
              >
                <IconSymbol name="filter-list" size={20} color={showFilters ? colors.background : colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Expanded Filters Panel */}
            {showFilters && (
              <View className="px-2 pt-2 gap-2 border-t border-border">
                {/* Status Filter */}
                <FormSelect
                  value={statusFilter}
                  label="Status"
                  onValueChange={(value) => setStatusFilter(value as CattleResult)}
                  options={["all", ...Object.keys(STATUS_CATTLE)].map((status: string) => ({
                    label: status === "all" ? "Todos" : STATUS_CATTLE[status as CattleResult].text,
                    value: status,
                  }))}
                />

                {/* Breed Filter */}
                {breeds.length > 2 && (
                  <FormSelect
                    value={breedFilter}
                    label="Raça"
                    onValueChange={(value) => setBreedFilter(value)}
                    options={breeds.map((breed) => ({
                      label: breed === "all" ? "Todas" : breed,
                      value: breed,
                    }))}
                  />
                )}

                {/* Age Range Filter */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-muted">Idade (anos)</Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      placeholder="Mín"
                      value={ageRange.min}
                      onChangeText={(val) => setAgeRange({ ...ageRange, min: val })}
                      keyboardType="numeric"
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                    <Text className="text-muted">até</Text>
                    <TextInput
                      placeholder="Máx"
                      value={ageRange.max}
                      onChangeText={(val) => setAgeRange({ ...ageRange, max: val })}
                      keyboardType="numeric"
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                    <TouchableOpacity onPress={() => setAgeRange({ min: "", max: "" })} className="p-2">
                      <IconSymbol name="cancel" size={20} color={colors.muted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Clear All Filters */}
                <TouchableOpacity onPress={handleClearFilters} className="mt-2">
                  <Text className="text-primary text-center font-medium">Limpar Todos os Filtros</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* List */}
          {filteredCattle.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <IconSymbol name="cow-off" color={colors.muted} />
              <Text className="text-muted text-center text-base">
                {searchQuery ? "Nenhum animal encontrado" : "Nenhum animal cadastrado ainda"}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredCattle.map((item) => (
                <CattleCard
                  key={item.id}
                  cattle={item}
                  status={getStatus(item)}
                  onPress={() => navigation.navigate("CattleDetail", { id: item.id })}
                />
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
      <ButtonAdd
        label="Adicionar Animal"
        color={colors.primary}
        icon="add"
        onPress={() => navigation.navigate("CattleCad")}
      />
    </ScreenContainer>
  );
}
