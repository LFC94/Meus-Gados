import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CattleCardCompact } from "@/components/cattle-card";
import { IconSymbol } from "@/components/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import useNavigation from "@/hooks/use-navigation";
import { cattleStorage, diseaseStorage, pregnancyStorage, vaccinationRecordStorage } from "@/lib/storage";
import { Cattle } from "@/types";

export default function HomeScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCattle: 0,
    healthy: 0,
    pregnant: 0,
    pendingVaccines: 0,
    inTreatment: 0,
    overduePregnancies: 0,
  });
  const [recentCattle, setRecentCattle] = useState<Cattle[]>([]);
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cattle, vaccinesData, pregnanciesData, diseasesData] = await Promise.all([
        cattleStorage.getAll(),
        vaccinationRecordStorage.getAll(),
        pregnancyStorage.getAll(),
        diseaseStorage.getAll(),
      ]);

      // Calculate stats
      let healthy = 0;
      let pregnant = 0;
      let pendingVaccines = 0;
      let inTreatment = 0;
      let overduePregnancies = 0;

      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      for (const animal of cattle) {
        const inDeath = diseasesData.find((d) => d.cattleId === animal.id && d.result === "death");
        if (inDeath) {
          continue;
        }

        // Check pregnancy status
        const activePregnancy = pregnanciesData.find((p) => p.cattleId === animal.id && p.result === "pending");
        if (activePregnancy) {
          const expectedBirthDate = new Date(activePregnancy.expectedBirthDate);
          if (today > expectedBirthDate) {
            overduePregnancies++;
          } else {
            pregnant++;
          }
          continue; // Pregnant animals are counted separately
        }

        // Check disease status
        const inTreat = diseasesData.find((d) => d.cattleId === animal.id && d.result === "in_treatment");
        if (inTreat) {
          inTreatment++;
          continue; // Animals in treatment are counted separately
        }

        // Check vaccine status
        const animalVaccines = vaccinesData.filter((v) => v.cattleId === animal.id);
        const hasPendingVaccine = animalVaccines.some((v) => {
          if (!v.nextDoseDate) return false;
          const nextDoseDate = new Date(v.nextDoseDate);
          return nextDoseDate <= thirtyDaysFromNow;
        });
        if (hasPendingVaccine) {
          pendingVaccines++;
          continue; // Animals with pending vaccines are counted separately
        }

        // If no special status, count as healthy
        healthy++;
      }

      setStats({
        totalCattle: cattle.length,
        healthy,
        pregnant,
        pendingVaccines,
        inTreatment,
        overduePregnancies,
      });

      // Recent animals (last 3)
      const sorted = [...cattle].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentCattle(sorted.slice(0, 3));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData]),
  );

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
      >
        <View className="p-6 gap-6 flex-1" style={{ paddingBottom: insets.bottom }}>
          {/* Status Cards */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              {/* Saudáveis */}
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
                style={{ opacity: 1 }}
                onPress={() => navigation.navigate("CattleList", { status: "healthy" })}
              >
                <Text className="text-3xl font-bold" style={{ color: "#22C55E" }}>
                  {stats.healthy}
                </Text>
                <Text className="text-sm text-muted mt-2">Saudáveis</Text>
              </TouchableOpacity>

              {/* Gestantes */}
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
                style={{ opacity: 1 }}
                onPress={() => navigation.navigate("CattleList", { status: "pregnancy" })}
              >
                <Text className="text-3xl font-bold" style={{ color: "#3B82F6" }}>
                  {stats.pregnant}
                </Text>
                <Text className="text-sm text-muted mt-2">Gestantes</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              {/* Vacinas Pendentes */}
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
                style={{ opacity: 1 }}
                onPress={() => navigation.navigate("VaccinePending")}
              >
                <Text className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
                  {stats.pendingVaccines}
                </Text>
                <Text className="text-sm text-muted mt-2">Vacinas Pend.</Text>
              </TouchableOpacity>

              {/* Em Tratamento */}
              <TouchableOpacity
                className="flex-1 bg-surface rounded-2xl p-4 border border-border"
                style={{ opacity: 1 }}
                onPress={() => navigation.navigate("CattleList", { status: "in_treatment" })}
              >
                <Text className="text-3xl font-bold" style={{ color: "#EF4444" }}>
                  {stats.inTreatment}
                </Text>
                <Text className="text-sm text-muted mt-2">Em Tratamento</Text>
              </TouchableOpacity>
            </View>

            {/* Atrasadas */}
            {stats.overduePregnancies > 0 && (
              <View className="bg-error/10 rounded-2xl p-4 border border-error">
                <Text className="text-error font-semibold">
                  ⚠️ {stats.overduePregnancies} gestação{stats.overduePregnancies > 1 ? "ões" : ""} atrasada
                  {stats.overduePregnancies > 1 ? "s" : ""} - Verificar!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate("CattleList")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-lg">🐄</Text>
                </View>
                <Text className="text-foreground font-semibold">Ver Todos os Animais</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("VaccinePending")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-warning/20 items-center justify-center">
                  <Text className="text-lg">💉</Text>
                </View>
                <Text className="text-foreground font-semibold">Vacinas Pendentes</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ScheduledNotifications")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-lg">🔔</Text>
                </View>
                <Text className="text-foreground font-semibold">Notificações Agendadas</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Recent Animals */}
          {recentCattle.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Animais Recentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate("CattleList")} style={{ opacity: 1 }}>
                  <Text className="text-primary text-sm font-semibold">Ver todos</Text>
                </TouchableOpacity>
              </View>
              <View className="gap-2">
                {recentCattle.map((item) => (
                  <CattleCardCompact
                    key={item.id}
                    cattle={item}
                    onPress={() => navigation.navigate("CattleDetail", { id: item.id })}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
