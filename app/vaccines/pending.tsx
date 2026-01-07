import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { daysUntil, formatDate, getVaccineStatus, getVaccineStatusColor } from "@/lib/helpers";
import { vaccineStorage } from "@/lib/storage";
import { Cattle, Vaccine } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PendingVaccinesScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingVaccines, setPendingVaccines] = useState<(Vaccine & { cattle: Cattle })[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadPendingVaccines();
    }, [])
  );

  const loadPendingVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccineStorage.getPending();
      setPendingVaccines(data);
    } catch (error) {
      console.error("Error loading pending vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await vaccineStorage.getPending();
      setPendingVaccines(data);
    } catch (error) {
      console.error("Error refreshing pending vaccines:", error);
    } finally {
      setRefreshing(false);
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
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-6 gap-4 flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Vacinas Pendentes</Text>
              <Text className="text-sm text-muted mt-1">
                {pendingVaccines.length} {pendingVaccines.length === 1 ? "vacina" : "vacinas"} próximas ou atrasadas
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center"
              style={{ opacity: 1 }}
            >
              <Text className="text-primary font-semibold text-base">Voltar</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {pendingVaccines.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-muted text-center text-base">Nenhuma vacina pendente no momento</Text>
            </View>
          ) : (
            <View className="gap-3 pb-6">
              {pendingVaccines.map((item) => {
                const status = getVaccineStatus(item.nextDose);
                const statusColor = getVaccineStatusColor(status);
                const days = item.nextDose ? daysUntil(item.nextDose) : 0;
                const isOverdue = days < 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => navigation.navigate("CattleDetail", { id: item.cattleId })}
                    className="bg-surface rounded-2xl p-4 border border-border"
                    style={{ opacity: 1 }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {item.cattle.name || `Animal ${item.cattle.number}`}
                        </Text>
                        <Text className="text-sm text-muted mt-1">Nº {item.cattle.number}</Text>
                        <Text className="text-sm text-foreground font-medium mt-2">{item.name}</Text>
                        {item.nextDose && (
                          <Text className="text-sm text-muted mt-1">Próxima dose: {formatDate(item.nextDose)}</Text>
                        )}
                      </View>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusColor + "20" }}>
                        <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                          {isOverdue ? `${Math.abs(days)}d atrasada` : `${days}d restantes`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
