import { CattleCard } from "@/components/cattle-card";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import useNavigation from "@/hooks/use-navigation";
import useScreenHeader from "@/hooks/use-screen-header";
import { cattleStorage, diseaseStorage, pregnancyStorage, vaccinationRecordStorage } from "@/lib/storage";
import { Cattle, CattleResult, Disease, Pregnancy, VaccinationRecord } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CattleListScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [filteredCattle, setFilteredCattle] = useState<Cattle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [vaccines, setVaccines] = useState<VaccinationRecord[]>([]);
  const insets = useSafeAreaInsets();
  useScreenHeader("Meu Rebanho", `${cattle.length} ${cattle.length === 1 ? "animal" : "animais"} cadastrados`);
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    filterCattle();
  }, [searchQuery, cattle, pregnancies, diseases, vaccines]);

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

  const filterCattle = () => {
    if (!searchQuery.trim()) {
      setFilteredCattle(cattle);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cattle.filter((c) => {
      const matchesNumber = c.number.toLowerCase().includes(query);
      const matchesName = c.name?.toLowerCase().includes(query);
      const matchesBreed = c.breed.toLowerCase().includes(query);
      return matchesNumber || matchesName || matchesBreed;
    });

    setFilteredCattle(filtered);
  };

  const getStatus = (cattleItem: Cattle): CattleResult => {
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
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
        className="pt-4"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="px-6 gap-4 flex-1">
          {/* Search */}
          <View className="bg-surface rounded-xl px-4 border border-border">
            <TextInput
              placeholder="Buscar por número, nome ou raça..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-base text-foreground"
            />
          </View>

          {/* List */}
          {filteredCattle.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-muted text-center text-base">
                {searchQuery ? "Nenhum animal encontrado" : "Nenhum animal cadastrado ainda"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CattleEdit")}
                  className="mt-4 bg-primary rounded-full px-6 py-3"
                  style={{ opacity: 1 }}
                >
                  <Text className="text-background font-semibold">Cadastrar Primeiro Animal</Text>
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
                onPress={() => navigation.navigate("CattleEdit")}
                className="bg-primary rounded-full p-4 items-center mt-4"
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
