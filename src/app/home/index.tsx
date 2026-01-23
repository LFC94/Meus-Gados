import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardResume } from "@/components";
import { CattleCardCompact } from "@/components/cattle-card";
import { IconSymbol } from "@/components/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { STATUS_CATTLE } from "@/constants/const";
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

        // Check vaccine status
        const animalVaccines = vaccinesData.filter((v) => v.cattleId === animal.id);
        const hasPendingVaccine = animalVaccines.some((v) => {
          if (!v.nextDoseDate) return false;
          const nextDoseDate = new Date(v.nextDoseDate);
          return nextDoseDate <= thirtyDaysFromNow;
        });
        if (hasPendingVaccine) {
          pendingVaccines++;
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
        }

        // Check disease status
        const inTreat = diseasesData.find((d) => d.cattleId === animal.id && d.result === "in_treatment");
        if (inTreat) {
          inTreatment++;
          continue; // Animals in treatment are counted separately
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
          <Text className="text-lg font-semibold text-foreground">Resumo do Rebanho</Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <CardResume
                number={stats.healthy}
                title="Saudáveis"
                icon="favorite"
                color={STATUS_CATTLE["healthy"].color}
                onPress={() => navigation.navigate("CattleList", { status: "healthy" })}
              />
              {/* Em Tratamento */}
              <CardResume
                number={stats.inTreatment}
                title="Em Tratamento"
                icon="medical-services"
                color={STATUS_CATTLE["in_treatment"].color}
                onPress={() => navigation.navigate("CattleList", { status: "in_treatment" })}
              />
            </View>
            <View className="flex-row gap-3">
              {/* Vacinas Pendentes */}
              <CardResume
                number={stats.pendingVaccines}
                title="Vacinas Pendentes"
                icon="vaccines"
                color={STATUS_CATTLE["pending_vaccine"].color}
                onPress={() => navigation.navigate("VaccinePending")}
              />

              {/* Gestantes */}
              <CardResume
                number={stats.pregnant}
                title="Gestantes"
                icon="stroller"
                color={STATUS_CATTLE["pregnancy"].color}
                onPress={() => navigation.navigate("CattleList", { status: "pregnancy" })}
              />
            </View>

            {/* Atrasadas */}
            {stats.overduePregnancies > 0 && (
              <View className="rounded-2xl p-4 border border-error bg-error/20">
                <Text className="text-error font-semibold">
                  ⚠️ {stats.overduePregnancies} gestação{stats.overduePregnancies > 1 ? "ões" : ""} atrasada
                  {stats.overduePregnancies > 1 ? "s" : ""} - Verificar!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Ação Rápidas</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CattleList")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-primary/20">
                  <Text className="text-lg">🐄</Text>
                </View>
                <Text className="text-foreground font-semibold">Ver Todos os Animais</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("MilkProductionList")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#ffffff20" }}
                >
                  <Text className="text-lg">🥛</Text>
                </View>
                <Text className="text-foreground font-semibold">Produção de Leite</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("VaccinePending")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-warning/20">
                  <Text className="text-lg">💉</Text>
                </View>
                <Text className="text-foreground font-semibold">Vacinas Pendentes</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ScheduledNotifications")}
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between"
              style={{ opacity: 1 }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#ffd90020" }}
                >
                  <Text className="text-lg">🔔</Text>
                </View>
                <Text className="text-foreground font-semibold">Notificações Agendadas</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={colors.muted} />
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
