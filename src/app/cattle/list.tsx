import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CattleCard, FormSelect, IconSymbol } from "@/components/";
import { ScreenContainer } from "@/components/screen-container";
import { STATUS_CATTLE } from "@/constants/const";
import { useColors } from "@/hooks/use-colors";
import useNavigation from "@/hooks/use-navigation";
import useScreenHeader from "@/hooks/use-screen-header";
import { calculateAge } from "@/lib/helpers";
import { cattleStorage, diseaseStorage, pregnancyStorage, vaccinationRecordStorage } from "@/lib/storage";
import { Cattle, CattleResult, Disease, Pregnancy, RootStackParamList, VaccinationRecord } from "@/types";

export default function CattleListScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "CattleList">>();
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing] = useState(false);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [filteredCattle, setFilteredCattle] = useState<Cattle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [vaccines, setVaccines] = useState<VaccinationRecord[]>([]);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CattleResult | "all">(route.params?.status || "all");
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const insets = useSafeAreaInsets();
  useScreenHeader("Meu Rebanho", `${cattle.length} ${cattle.length === 1 ? "animal" : "animais"} cadastrados`);

  useEffect(() => {
    setStatusFilter(route.params?.status || "all");
    setShowFilters(!!route.params?.status);
  }, [route.params?.status]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const getStatus = useCallback(
    (cattleItem: Cattle): CattleResult => {
      // Check if in treatment for disease
      const inDeath = diseases.find((d) => d.cattleId === cattleItem.id && d.result === "death");
      if (inDeath) {
        return "death"; // death - red
      }

      // Check if in treatment for disease
      const inTreatment = diseases.find((d) => d.cattleId === cattleItem.id && d.result === "in_treatment");
      if (inTreatment) {
        return "in_treatment"; // In treatment - orange
      }

      // Check if pregnant (active pregnancy)
      const activePregnancy = pregnancies.find((p) => p.cattleId === cattleItem.id && p.result === "pending");
      if (activePregnancy) {
        const expectedBirthDate = new Date(activePregnancy.expectedBirthDate);
        if (new Date() > expectedBirthDate) {
          return "overdue_pregnancy"; // Overdue pregnancy - red
        }
        return "pregnancy";
      }

      // Check for pending vaccines (within 30 days)
      const pendingVaccine = vaccines.find((v) => {
        if (v.cattleId !== cattleItem.id) return false;
        if (!v.nextDoseDate) return false;
        const nextDoseDate = new Date(v.nextDoseDate);
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return nextDoseDate <= thirtyDaysFromNow;
      });
      if (pendingVaccine) {
        return "pending_vaccine"; // Pending vaccine - yellow
      }

      return "healthy"; // Healthy - green
    },
    [diseases, pregnancies, vaccines],
  );

  const breeds = useMemo(() => {
    const uniqueBreeds = Array.from(new Set(cattle.map((c) => c.breed))).filter(Boolean);
    return ["all", ...uniqueBreeds.sort()];
  }, [cattle]);

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
      console.error("Error loading cattle:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCattle = useCallback(() => {
    let filtered = [...cattle];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const matchesNumber = c.number.toLowerCase().includes(query);
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesBreed = c.breed.toLowerCase().includes(query);
        return matchesNumber || matchesName || matchesBreed;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => getStatus(c) === statusFilter);
    }

    // Breed filter
    if (breedFilter !== "all") {
      filtered = filtered.filter((c) => c.breed === breedFilter);
    }

    // Age filter
    if (ageRange.min || ageRange.max) {
      filtered = filtered.filter((c) => {
        const age = calculateAge(c.birthDate);
        const minMatch = ageRange.min ? age >= parseInt(ageRange.min, 10) : true;
        const maxMatch = ageRange.max ? age <= parseInt(ageRange.max, 10) : true;
        return minMatch && maxMatch;
      });
    }

    setFilteredCattle(filtered);
  }, [cattle, searchQuery, statusFilter, breedFilter, ageRange, getStatus]);

  useEffect(() => {
    filterCattle();
  }, [filterCattle]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
        className="pt-4"
      >
        <View className="p-6 gap-4 flex-1" style={{ marginBottom: insets.bottom }}>
          {/* Search and Filters Toggle */}
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
              <IconSymbol name="menu" size={20} color={showFilters ? colors.background : colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <View className="bg-surface rounded-xl p-4 border border-border gap-4">
              {/* Status Filter */}
              {
                <View className="gap-2">
                  <FormSelect
                    value={statusFilter}
                    label="Status"
                    onValueChange={(value) => setStatusFilter(value as CattleResult)}
                    options={["all", ...Object.keys(STATUS_CATTLE)].map((status: string) => ({
                      label: status === "all" ? "Todos" : STATUS_CATTLE[status as CattleResult].text,
                      value: status,
                    }))}
                  />
                </View>
              }

              {/* Breed Filter */}
              {breeds.length > 2 && (
                <View className="gap-2">
                  <FormSelect
                    value={breedFilter}
                    label="Raça"
                    onValueChange={(value) => setBreedFilter(value)}
                    options={breeds.map((breed) => ({
                      label: breed === "all" ? "Todas" : breed,
                      value: breed,
                    }))}
                  />
                </View>
              )}

              {/* Age Range Filter */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-muted">Idade (anos)</Text>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    placeholder="Mín"
                    value={ageRange.min}
                    onChangeText={(val) => setAgeRange((prev) => ({ ...prev, min: val }))}
                    keyboardType="numeric"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                  <Text className="text-muted">até</Text>
                  <TextInput
                    placeholder="Máx"
                    value={ageRange.max}
                    onChangeText={(val) => setAgeRange((prev) => ({ ...prev, max: val }))}
                    keyboardType="numeric"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                  <TouchableOpacity onPress={() => setAgeRange({ min: "", max: "" })} className="p-2">
                    <IconSymbol name="cancel" size={20} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Clear All Filters */}
              <TouchableOpacity
                onPress={() => {
                  setStatusFilter("all");
                  setBreedFilter("all");
                  setAgeRange({ min: "", max: "" });
                  setSearchQuery("");
                }}
                className="mt-2"
              >
                <Text className="text-primary text-center font-medium">Limpar Todos os Filtros</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          {filteredCattle.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-4xl mb-4">🐄</Text>
              <Text className="text-muted text-center text-base">
                {searchQuery ? "Nenhum animal encontrado" : "Nenhum animal cadastrado ainda"}
              </Text>

              {!searchQuery && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CattleCad")}
                  className="mt-4 bg-primary rounded-xl px-6 py-3"
                  style={{ opacity: 1 }}
                >
                  <Text className="text-white font-semibold">+ Cadastrar Primeiro Animal</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
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

              {/* Add Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate("CattleCad")}
                className="bg-primary rounded-xl p-4 items-center mt-4"
                style={{ opacity: 1 }}
              >
                <Text className="text-background font-semibold text-base">+ Cadastrar Novo Animal</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
